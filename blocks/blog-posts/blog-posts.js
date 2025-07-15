import { createOptimizedPicture } from '../../scripts/aem.js';

// Function to extract path from URL if it matches current hostname
function getPathFromUrl(url) {
  // Get current hostname
  const currentHostname = window.location.hostname;

  try {
    const urlObj = new URL(url, window.location.origin);

    // Check if the URL hostname matches current hostname
    if (urlObj.hostname === currentHostname) {
      return urlObj.pathname;
    }
    // If it's a relative URL, return it as is
    if (!url.startsWith('http')) {
      return url;
    }
    // If hostname doesn't match, return only the current hostname
    return '';
  } catch (error) {
    // If URL parsing fails, treat as relative path
    return url;
  }
}

// Function to fetch data from the API
export async function fetchData(source) {
  const response = await fetch(source);
  if (!response.ok) {
    return null;
  }

  const json = await response.json();

  if (!json) {
    return null;
  }

  // Check if it's an array directly or nested in a property
  if (Array.isArray(json)) {
    return json;
  } if (json.data && Array.isArray(json.data)) {
    return json.data;
  } if (json.children && Array.isArray(json.children)) {
    return json.children;
  }

  return null;
}

// Function to render data in the block
function renderData(data, block) {
  if (!data) {
    return;
  }

  if (!Array.isArray(data)) {
    return;
  }

  // Sort data by lastModified in descending order (newest first)
  const sortedData = data.sort((a, b) => {
    const aTime = parseInt(a.lastModified, 10) || 0;
    const bTime = parseInt(b.lastModified, 10) || 0;
    return bTime - aTime; // Descending order
  });

  // Build a <ul> with <li> for each blog post
  const ul = document.createElement('ul');
  ul.className = 'blog-posts-list';

  sortedData.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'blog-post-item';

    // Create the blog post card structure
    const card = document.createElement('div');
    card.className = 'blog-post-card';

    // Image section
    if (post.image) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'blog-post-image';

      // Create picture element with optimized image
      const picture = createOptimizedPicture(post.image, post.title || 'Blog post image', false, [{ width: '750' }]);
      imageDiv.appendChild(picture);
      card.appendChild(imageDiv);
    }

    // Content section
    const contentDiv = document.createElement('div');
    contentDiv.className = 'blog-post-content';

    // Title
    if (post.title) {
      const titleDiv = document.createElement('h3');
      titleDiv.className = 'blog-post-title';
      titleDiv.textContent = post.title;
      contentDiv.appendChild(titleDiv);
    }

    // Category
    if (post.category) {
      const categoryDiv = document.createElement('div');
      const categoryItem = document.createElement('span');
      categoryDiv.className = 'blog-post-category';
      categoryItem.textContent = `${post.category}`;
      categoryDiv.appendChild(categoryItem);
      contentDiv.appendChild(categoryDiv);
    }

    // Description
    if (post.description) {
      const descDiv = document.createElement('p');
      descDiv.className = 'blog-post-description';
      descDiv.textContent = post.description;
      contentDiv.appendChild(descDiv);
    }

    // Author and date
    const metaDiv = document.createElement('div');
    metaDiv.className = 'blog-post-meta';

    /* if (post.author) {
      const authorDiv = document.createElement('span');
      authorDiv.className = 'blog-post-author';
      authorDiv.textContent = `${post.author}`;
      metaDiv.appendChild(authorDiv);
    } */

    if (post['publish-date']) {
      const dateDiv = document.createElement('span');
      dateDiv.className = 'blog-post-date';
      dateDiv.textContent = post['publish-date'];
      metaDiv.appendChild(dateDiv);
    }

    contentDiv.appendChild(metaDiv);
    card.appendChild(contentDiv);

    // Wrap in link if path exists
    if (post.path) {
      const link = document.createElement('a');
      link.href = post.path;
      link.className = 'blog-post-link';
      link.appendChild(card);
      li.appendChild(link);
    } else {
      li.appendChild(card);
    }

    ul.appendChild(li);
  });

  // Clear block and append the list
  block.textContent = '';
  block.appendChild(ul);
}

export default async function decorate(block) {
  // Capture Link and Path from first div
  const link = block.querySelector('a');
  const href = link ? link.getAttribute('href') : block.textContent.trim();

  const path = getPathFromUrl(href);

  // Build the final URL
  let finalUrl;
  if (path === '') {
    // If path is empty (external URL), construct new URL with current hostname and port
    const currentHostname = window.location.hostname;
    const currentPort = window.location.port;
    const currentProtocol = window.location.protocol;
    const urlObj = new URL(href, window.location.origin);

    // Include port if it exists (not 80 for http or 443 for https)
    const portSuffix = currentPort && currentPort !== '80' && currentPort !== '443' ? `:${currentPort}` : '';
    finalUrl = `${currentProtocol}//${currentHostname}${portSuffix}${urlObj.pathname}`;
  } else {
    // If path has content, use it
    finalUrl = `${path}`;
  }

  const data = await fetchData(finalUrl);

  // Render Block with data
  renderData(data, block);
}
