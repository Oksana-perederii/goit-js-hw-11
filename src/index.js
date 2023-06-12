import { getProducts } from './js/products';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const searchFormRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const loadMoreBtnRef = document.querySelector('.load-more');

let lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

let page = 1;
let totalHits;
loadMoreBtnRef.style.display = 'none';
let searchTopic;

loadMoreBtnRef.addEventListener('click', showMoreImage);
searchFormRef.addEventListener('submit', getAllProducts);

async function getAllProducts(e) {
  e.preventDefault();
  page = 1;
  clearGallery();
  if (!searchFormRef.elements[0].value.trim()) {
    return Notify.failure(
      'Sorry, You have not entered what you want to search for. Please try again.'
    );
  }
  await searchRequest();
  if ([galleryRef][0].childElementCount >= totalHits) {
    notification();
    return (loadMoreBtnRef.style.display = 'none');
  }
  loadMoreBtnRef.style.display = 'block';
  notification();
}

async function searchRequest() {
  const searchTopic = searchFormRef.elements[0].value.trim();
  const { data } = await getProducts(searchTopic, page);

  const hits = data.hits;
  totalHits = data.totalHits;
  renderImage(hits);
}

function renderImage(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
  <p class="info-item">Likes: 
    <b>${likes}</b>
  </p>
    <p class="info-item">Views: 
      <b>${views}</b>
    </p>
    <p class="info-item">Comments: 
      <b>${comments}</b>
    </p>
    <p class="info-item">Downloads:
      <b>${downloads}</b> 
    </p>
  </div>
</div>`;
      }
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);
  lightBox.refresh();
  if (page === 1) {
    return;
  }

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearGallery() {
  galleryRef.innerHTML = '';
}

async function showMoreImage() {
  page += 1;
  await searchRequest();
  await ifThereAreNoMoreImgNotification();
}

function notification() {
  if (!totalHits) {
    loadMoreBtnRef.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  Notify.success(`Hooray! We found ${totalHits} images`);
}

async function ifThereAreNoMoreImgNotification() {
  if ([galleryRef][0].childElementCount >= totalHits) {
    loadMoreBtnRef.style.display = 'none';
    return Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

// InfiniteScroll

const infiniteScrollCallback = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && searchTopic !== '') {
      showMoreImage();
    }
  });
};

const infiniteScroll = new IntersectionObserver(infiniteScrollCallback, {
  rootMargin: '400px',
  history: false,
});
infiniteScroll.observe(loadMoreBtnRef);
