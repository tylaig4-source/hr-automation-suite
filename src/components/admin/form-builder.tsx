"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Settings2 } from "lucide-react";

export type FieldType = "text" | "textarea" | "select" | "number" | "date" | "file";

export interface FieldOption {
    value: string;
    label: string;
}

export interface FormField {
    name: string; // slug
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: FieldOption[]; // for select
    rows?: number; // for textarea
}

interface FormBuilderProps {
    fields: FormField[];
    onChange: (fields: FormField[]) => void;
}

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
    const [activeField, setActiveField] = useState<number | null>(null);

    const addField = () => {
        const newField: FormField = {
            name: `campo_${fields.length + 1}`,
            label: "Novo Campo",
            type: "text",
            required: true,
        };
        onChange([...fields, newField]);
        setActiveField(fields.length);
    };

    const removeField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        onChange(newFields);
        if (activeField === index) setActiveField(null);
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };

        // Validar slug (apenas letras minúsculas, números e underline)
        if (updates.name) {
            newFields[index].name = updates.name
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "_")
                .replace(/^_+|_+$/g, "") // remove underlines do inicio/fim
                .replace(/_+/g, "_"); // remove underlines duplicados
        }

        onChange(newFields);
    };

    const addOption = (fieldIndex: number) => {
        const field = fields[fieldIndex];
        const options = field.options || [];
        updateField(fieldIndex, {
            options: [...options, { value: `opcao_${options.length + 1}`, label: "Nova Opção" }],
        });
    };

    const updateOption = (fieldIndex: number, optionIndex: number, key: keyof FieldOption, value: string) => {
        const field = fields[fieldIndex];
        const options = [...(field.options || [])];
        options[optionIndex] = { ...options[optionIndex], [key]: value };
        updateField(fieldIndex, { options });
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = fields[fieldIndex];
        const options = (field.options || []).filter((_, i) => i !== optionIndex);
        updateField(fieldIndex, { options });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Campos do Formulário</h3>
                <Button onClick={addField} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Campo
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <Card key={index} className={`relative border-l-4 ${activeField === index ? 'border-l-primary' : 'border-l-transparent'}`}>
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setActiveField(activeField === index ? null : index)}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                <div className="flex flex-col">
                                    <span className="font-medium">{field.label || "Sem rótulo"}</span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono bg-muted px-1 rounded">{`{{${field.name}}}`}</span>
                                        <span>•</span>
                                        <span className="uppercase">{field.type}</span>
                                        {field.required && (
                                            <>
                                                <span>•</span>
                                                <span className="text-red-500">Obrigatório</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeField(index);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Settings2 className={`h-4 w-4 transition-transform ${activeField === index ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                            </div>
                        </CardHeader>

                        {activeField === index && (
                            <CardContent className="pt-0 pb-4 px-4 border-t bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                                    {/* Label */}
                                    <div className="space-y-2">
                                        <Label>Rótulo (Label)</Label>
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(index, { label: e.target.value })}
                                            placeholder="Ex: Nome do Colaborador"
                                        />
                                    </div>

                                    {/* Nome da Variável (Slug) */}
                                    <div className="space-y-2">
                                        <Label>Nome da Variável (Slug)</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-sm font-mono">{`{{`}</span>
                                            <Input
                                                value={field.name}
                                                onChange={(e) => updateField(index, { name: e.target.value })}
                                                placeholder="nome_da_variavel"
                                                className="font-mono text-sm"
                                            />
                                            <span className="text-muted-foreground text-sm font-mono">{`}}`}</span>
                                        </div>
                                    </div>

                                    {/* Tipo */}
                                    <div className="space-y-2">
                                        <Label>Tipo do Campo</Label>
                                        <Select
                                            value={field.type}
                                            onValueChange={(value) => updateField(index, { type: value as FieldType })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Texto Curto</SelectItem>
                                                <SelectItem value="textarea">Texto Longo</SelectItem>
                                                <SelectItem value="number">Número</SelectItem>
                                                <SelectItem value="date">Data</SelectItem>
                                                <SelectItem value="select">Seleção (Dropdown)</SelectItem>
                                                <SelectItem value="file">Arquivo (Upload)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Placeholder */}
                                    <div className="space-y-2">
                                        <Label>Placeholder (Dica)</Label>
                                        <Input
                                            value={field.placeholder || ""}
                                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                            placeholder="Ex: Digite o nome aqui..."
                                        />
                                    </div>

                                    {/* Helper Text */}
                                    <div className="space-y-2">
                                        <Label>Texto de Ajuda</Label>
                                        <Input
                                            value={field.helperText || ""}
                                            onChange={(e) => updateField(index, { helperText: e.target.value })}
                                            placeholder="Instruções adicionais abaixo do campo"
                                        />
                                    </div>

                                    {/* Required Switch */}
                                    <div className="flex items-center justify-between md:col-span-2 border p-3 rounded-lg bg-background">
                                        <Label className="cursor-pointer" htmlFor={`req-${index}`}>Campo Obrigatório</Label>
                                        <Switch
                                            id={`req-${index}`}
                                            checked={field.required}
                                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                                        />
                                    </div>

                                    {/* Opções para Select */}
                                    {field.type === 'select' && (
                                        <div className="md:col-span-2 space-y-3 border p-4 rounded-lg bg-background">
                                            <div className="flex justify-between items-center">
                                                <Label>Opções de Seleção</Label>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addOption(index)}>
                                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Opção
                                                </Button>
                                            </div>

                                            {(!field.options || field.options.length === 0) && (
                                                <p className="text-sm text-muted-foreground text-center py-2">Nenhuma opção adicionada.</p>
                                            )}

                                            <div className="space-y-2">
                                                {field.options?.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex gap-2 items-center">
                                                        <Input
                                                            value={option.label}
                                                            onChange={(e) => updateOption(index, optIndex, 'label', e.target.value)}
                                                            placeholder="Label (Ex: Marketing)"
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            value={option.value}
                                                            onChange={(e) => updateOption(index, optIndex, 'value', e.target.value)}
                                                            placeholder="Valor (Ex: marketing)"
                                                            className="flex-1 font-mono text-sm"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive"
                                                            onClick={() => removeOption(index, optIndex)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
                        <p>Nenhum campo configurado.</p>
                        <Button variant="link" onClick={addField}>Adicionar o primeiro campo</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
