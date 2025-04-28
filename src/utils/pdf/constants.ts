
import { rgb } from 'pdf-lib';

export const PDFColors = {
  primary: rgb(0.96, 0.51, 0.13), // #f58220
  text: rgb(0.12, 0.12, 0.12),    // #1e1e1e
  muted: rgb(0.4, 0.4, 0.4),      // text-muted
  white: rgb(1, 1, 1),            // #ffffff
  blue: rgb(0.2, 0.6, 0.9),       // azul institucional
  lightGray: rgb(0.97, 0.97, 0.97), // #f8f8f8 - fundo claro para linhas alternadas
};

export const PDFConfig = {
  pageSize: {
    width: 595.276,
    height: 841.890
  },
  margins: {
    default: 50
  },
  spacing: {
    section: 30,
    paragraph: 20,
    lineHeight: 1.5
  },
  fontSize: {
    title: 24,
    subtitle: 18,
    heading: 16,
    body: 11,
    small: 9
  },
  templates: {
    basePath: '/pdf-templates',
    pages: {
      cover: '/pdf-templates/cover.jpg',
      institutional: '/pdf-templates/institucional.jpg',
      confidentiality: '/pdf-templates/confidentiality.jpg',
      quote: '/pdf-templates/quote.jpg',
      datacenter: '/pdf-templates/datacenter.jpg',
      contact: '/pdf-templates/contact.jpg',
    },
    logos: {
      main: '/pdf-templates/hostdime-logo.png',
      certification: '/pdf-templates/certification.png',
    },
    backgrounds: {
      orange: '/pdf-templates/orange-bg.jpg',
      white: '/pdf-templates/white-bg.jpg',
    }
  }
};
