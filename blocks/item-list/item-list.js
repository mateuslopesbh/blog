import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Build a <ul> with <li> for each row
  const ul = document.createElement('ul');
  ul.className = 'item-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    let linkHref = null;
    // Move all children of row into li as divs, and find the first link
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      const link = cell.querySelector('a');
      if (!linkHref && link) linkHref = link.href;
      li.append(cell);
    }
    // Assign classes to each div
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'item-list-card-image';
      } else {
        div.className = 'item-list-card-body';
      }
    });
    // For all items, wrap all .item-list-card-body in a wrapper
    const bodies = li.querySelectorAll('.item-list-card-body');
    if (bodies.length > 1) {
      const bodyWrapper = document.createElement('div');
      bodyWrapper.className = 'item-list-card-body-wrapper';
      bodies.forEach((body) => bodyWrapper.appendChild(body));
      // Insert after image if present, else at start
      const img = li.querySelector('.item-list-card-image');
      if (img && img.nextSibling) {
        li.insertBefore(bodyWrapper, img.nextSibling);
      } else {
        li.appendChild(bodyWrapper);
      }
    }
    // If a link was found, wrap all li content in an <a>
    if (linkHref) {
      const a = document.createElement('a');
      a.href = linkHref;
      a.style.display = 'block';
      // Move all children of li into the <a>
      while (li.firstChild) a.appendChild(li.firstChild);
      li.appendChild(a);
    }
    ul.append(li);
  });
  // Optimize all images
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });
  block.textContent = '';
  block.append(ul);
}
