import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Espera: block > div > [div, div, div]
  const row = block.firstElementChild;
  if (!row) return;

  const authorDiv = row.children[0];
  const photoDiv = row.children[1];
  const dateDiv = row.children[2];

  // Otimiza a imagem, se houver
  if (photoDiv && photoDiv.querySelector('img')) {
    const img = photoDiv.querySelector('img');
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '150r' }]);
    photoDiv.innerHTML = '';
    photoDiv.append(optimized);
    photoDiv.className = 'post-details-photo';
  }

  // Adiciona classes para estilização
  if (authorDiv) authorDiv.className = 'post-details-author';
  if (dateDiv) dateDiv.className = 'post-details-date';

  const authorWrapper = document.createElement('div');
  authorWrapper.className = 'post-details-author-wrapper';
  authorWrapper.append(authorDiv, dateDiv);

  // Cria o container final
  const container = document.createElement('div');
  container.className = 'post-details-content';
  if (photoDiv) container.append(photoDiv);
  if (authorWrapper) container.append(authorWrapper);

  block.append(container);
}
