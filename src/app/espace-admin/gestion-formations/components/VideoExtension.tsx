import { Node, mergeAttributes } from '@tiptap/core';

export const Video = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      style: {
        default: 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 10px auto; object-fit: contain;',
      },
      type: {
        default: 'video/mp4',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const source = element.querySelector('source');
          return {
            src: element.getAttribute('src') || source?.getAttribute('src'),
            controls: element.hasAttribute('controls'),
            style: element.getAttribute('style') || 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 0 auto; object-fit: contain;',
            type: source?.getAttribute('type') || 'video/mp4',
          };
        },
      },
      {
        // Parser aussi les divs qui contiennent des vidéos
        tag: 'div',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const video = element.querySelector('video');
          if (video) {
            const source = video.querySelector('source');
            return {
              src: video.getAttribute('src') || source?.getAttribute('src'),
              controls: video.hasAttribute('controls'),
              style: video.getAttribute('style') || 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 0 auto; object-fit: contain;',
              type: source?.getAttribute('type') || 'video/mp4',
            };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, controls, style, type } = HTMLAttributes;
    
    // Si on a un src, créer un élément video avec source dans un div centré
    if (src) {
      return [
        'div',
        {
          style: 'display: flex; justify-content: center; align-items: center; width: 100%; margin: 10px 0;',
        },
        [
          'video',
          mergeAttributes({
            controls: controls !== false,
            style: style || 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 0 auto; object-fit: contain;',
          }),
          ['source', { src, type: type || 'video/mp4' }],
        ],
      ];
    }
    
    // Sinon, retourner le HTML tel quel dans un div centré
    return [
      'div',
      {
        style: 'display: flex; justify-content: center; align-items: center; width: 100%; margin: 10px 0;',
      },
      [
        'video',
        mergeAttributes(HTMLAttributes, {
          controls: controls !== false,
          style: style || 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 0 auto; object-fit: contain;',
        }),
      ],
    ];
  },
});

