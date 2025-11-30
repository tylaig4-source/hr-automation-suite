import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer, findCustomerByEmail, type AsaasCustomer } from "@/lib/asaas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, cpfCnpj, phone, address, postalCode, addressNumber, city, state } = body;

    if (!name || !email || !cpfCnpj) {
      return NextResponse.json(
        { error: "Name, email and CPF/CNPJ are required" },
        { status: 400 }
      );
    }

    // Check if company already has an Asaas customer
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    });

    if (company?.asaasCustomerId) {
      return NextResponse.json({
        success: true,
        customerId: company.asaasCustomerId,
        message: "Customer already exists",
      });
    }

    // Check if customer already exists in Asaas
    let existingCustomer = await findCustomerByEmail(email);

    if (existingCustomer?.id) {
      // Update company with existing customer ID
      await prisma.company.update({
        where: { id: session.user.companyId },
        data: { asaasCustomerId: existingCustomer.id },
      });

      return NextResponse.json({
        success: true,
        customerId: existingCustomer.id,
        message: "Existing customer linked",
      });
    }

    // Create new customer in Asaas
    const customerData: AsaasCustomer = {
      name,
      email,
      cpfCnpj: cpfCnpj.replace(/\D/g, ""), // Remove non-digits
      phone,
      postalCode: postalCode?.replace(/\D/g, ""),
      address,
      addressNumber,
      city,
      state,
      externalReference: session.user.companyId,
    };

    const newCustomer = await createCustomer(customerData);

    if (!newCustomer.id) {
      throw new Error("Failed to create customer in Asaas");
    }

    // Update company with new customer ID
    await prisma.company.update({
      where: { id: session.user.companyId },
      data: { asaasCustomerId: newCustomer.id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: session.user.companyId,
        action: "CREATE_ASAAS_CUSTOMER",
        resource: "Company",
        resourceId: session.user.companyId,
        details: { asaasCustomerId: newCustomer.id },
      },
    });

    return NextResponse.json({
      success: true,
      customerId: newCustomer.id,
    });
  } catch (error) {
    console.error("Error creating Asaas customer:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create customer" },
      { status: 500 }
    );
  }
}

