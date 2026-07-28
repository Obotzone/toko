import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const AdminFormFields = ({ fields }: { fields: { name: string; label: string; type: string; value?: string; required?: boolean; options?: { value: string; label: string }[] }[] }): any => html`
  ${fields.map(f => html`
    ${f.options 
      ? html`
        <div>
          <label for="${f.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${f.label}</label>
          <select id="${f.name}" name="${f.name}" ${f.required ? 'required' : ''} class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
            <option value="">-- Pilih --</option>
            ${f.options.map(o => html`<option value="${o.value}" ${f.value === o.value ? 'selected' : ''}>${o.label}</option>`)}
          </select>
        </div>`
      : f.type === 'textarea'
        ? html`
          <div>
            <label for="${f.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${f.label}</label>
            <textarea id="${f.name}" name="${f.name}" rows="4" ${f.required ? 'required' : ''} class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">${f.value || ''}</textarea>
          </div>`
        : html`
          <div>
            <label for="${f.name}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${f.label}</label>
            <input type="${f.type}" id="${f.name}" name="${f.name}" value="${f.value || ''}" ${f.required ? 'required' : ''} class="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm">
          </div>`
    }
  `)}
`;
