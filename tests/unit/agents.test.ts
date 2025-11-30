import { describe, it, expect } from 'vitest';
import { mvpAgents } from '../../prompts/index';
import { categories } from '../../prompts/index';

describe('Agents Configuration', () => {
    it('should have unique IDs for all agents', () => {
        const ids = mvpAgents.map(agent => agent.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have unique slugs for all agents', () => {
        const slugs = mvpAgents.map(agent => agent.slug);
        const uniqueSlugs = new Set(slugs);
        expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('should have valid category IDs', () => {
        const categoryIds = categories.map(c => c.id);
        mvpAgents.forEach(agent => {
            expect(categoryIds).toContain(agent.categoryId);
        });
    });

    it('should have required fields in inputSchema', () => {
        mvpAgents.forEach(agent => {
            expect(agent.inputSchema.fields.length).toBeGreaterThan(0);
            agent.inputSchema.fields.forEach(field => {
                expect(field.name).toBeDefined();
                expect(field.label).toBeDefined();
                expect(field.type).toBeDefined();
            });
        });
    });

    it('should have systemPrompt and promptTemplate', () => {
        mvpAgents.forEach(agent => {
            expect(agent.systemPrompt).toBeDefined();
            expect(agent.systemPrompt.length).toBeGreaterThan(10);
            expect(agent.promptTemplate).toBeDefined();
            expect(agent.promptTemplate.length).toBeGreaterThan(10);
        });
    });
});
