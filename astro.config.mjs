import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://mohamedeletrepy.github.io',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      langs: [
        'bash', 'sh', 'shell', 'zsh',
        'powershell', 'ps1',
        'python', 'py',
        'javascript', 'js', 'typescript', 'ts',
        'c', 'cpp', 'csharp', 'cs',
        'php', 'ruby', 'go', 'rust',
        'sql', 'html', 'css', 'json', 'yaml',
        'dockerfile', 'markdown', 'xml',
        'nix', 'vim', 'lua',
      ],
      wrap: true,
      transformers: [],
    },
  },
});
