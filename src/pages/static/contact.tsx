import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

export const ContactPage = (): any => html`
  <div class="max-w-3xl mx-auto space-y-12">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white text-center">Hubungi Kami</h1>
    <div class="text-lg text-gray-600 dark:text-gray-400 text-center">
      <p>Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami melalui media di bawah ini.</p>
    </div>
    <div class="p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
      <div>
        <div class="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">support@etalase.id</p>
      </div>
      <div>
        <div class="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        </div>
        <h3 class="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">+62 812 3456 7890</p>
      </div>
    </div>
  </div>
`;
