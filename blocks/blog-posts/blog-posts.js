import { createOptimizedPicture } from '../../scripts/aem.js';

// Function to extract path from URL if it matches current hostname
function getPathFromUrl(url) {
  // eslint-disable-next-line no-console
  console.log('getPathFromUrl called with:', url);

  // Get current hostname
  const currentHostname = window.location.hostname;
  // eslint-disable-next-line no-console
  console.log('Current hostname:', currentHostname);

  try {
    const urlObj = new URL(url, window.location.origin);
    // eslint-disable-next-line no-console
    console.log('URL object:', urlObj);
    // eslint-disable-next-line no-console
    console.log('URL hostname:', urlObj.hostname);

    // Check if the URL hostname matches current hostname
    if (urlObj.hostname === currentHostname) {
      // eslint-disable-next-line no-console
      console.log('Hostname matches, returning pathname:', urlObj.pathname);
      return urlObj.pathname;
    }
    // If it's a relative URL, return it as is
    if (!url.startsWith('http')) {
      // eslint-disable-next-line no-console
      console.log('Relative URL, returning as is:', url);
      return url;
    }
    // If hostname doesn't match, return only the current hostname
    // eslint-disable-next-line no-console
    console.log('Hostname does not match, returning only hostname');
    return '';
  } catch (error) {
    // If URL parsing fails, treat as relative path
    // eslint-disable-next-line no-console
    console.log('URL parsing failed, treating as relative path:', url);
    return url;
  }
}

// Function to fetch data from the API
export async function fetchData(source) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }

  const json = await response.json();
  // eslint-disable-next-line no-console
  console.log('Raw JSON response:', json);

  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
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

  // eslint-disable-next-line no-console
  console.error('Unexpected data structure:', json);
  return null;
}

// Function to render data in the block
function renderData(data, block) {
  // eslint-disable-next-line no-console
  console.log('Data to render:', data);

  if (!data) {
    // eslint-disable-next-line no-console
    console.error('No data provided');
    return;
  }

  if (!Array.isArray(data)) {
    // eslint-disable-next-line no-console
    console.error('Data is not an array:', typeof data, data);
    return;
  }

  // Build a <ul> with <li> for each blog post
  const ul = document.createElement('ul');
  ul.className = 'blog-posts-list';

  data.forEach((post) => {
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
  // eslint-disable-next-line no-console
  console.log('Blog posts decorate function called with block:', block);
  // eslint-disable-next-line no-console
  console.log('Block HTML:', block.innerHTML);

  // Capture Link and Path from first div
  const link = block.querySelector('a');
  const href = link ? link.getAttribute('href') : block.textContent.trim();

  // eslint-disable-next-line no-console
  console.log('Link element:', link);
  // eslint-disable-next-line no-console
  console.log('Href value:', href);

  const path = getPathFromUrl(href);

  // eslint-disable-next-line no-console
  console.log('Extracted path:', path);

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

  // eslint-disable-next-line no-console
  console.log('Final URL:', finalUrl);

  const data = await fetchData(finalUrl);

  // eslint-disable-next-line no-console
  console.log('Fetched data:', data);

  // Render Block with data
  renderData(data, block);
}
