import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentBySlug, getCategoryById } from "../../../../../prompts";
import { AgentExecutor } from "./agent-executor";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const agent = getAgentBySlug(params.slug);

  if (!agent) {
    return {
      title: "Agente não encontrado",
    };
  }

  return {
    title: `${agent.name} | SaaS RH`,
    description: agent.description,
  };
}

export default function AgentPage({ params }: PageProps) {
  const agent = getAgentBySlug(params.slug);

  if (!agent) {
    notFound();
  }

  const category = getCategoryById(agent.categoryId);

  return <AgentExecutor agent={agent} category={category} />;
}
