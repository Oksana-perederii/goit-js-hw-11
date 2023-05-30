import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const KEY = '34508781-665843dc1d4446224c16b5110';
const restAPI = '&image_type=photo&orientation=horizontal&safesearch=true';
let page = 1;
let namePhoto = ' ';
const perPage = 40;

axios.defaults.baseURL = 'https://pixabay.com/api/';

async function searchPhoto(namePhoto, page = 1, perPage = 40) {
  const response = await axios(
    `?key=${KEY}&q=${namePhoto}${restAPI}&page=${page}&per_page=${perPage}`
  );
  return response;
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
});

const searchFormPoto = document.querySelector('#search-form');
const galleryPhoto = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchFormPoto.addEventListener('submit', onSubmitPhoto);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmitPhoto(e) {
  e.preventDefault();
  galleryPhoto.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  namePhoto = e.target.elements.searchQuery.value.trim();
  if (!namePhoto) {
    return Notify.failure(
      'Sorry, the search field cannot be empty. Please enter information to search.'
    );
  }
    const { data } = await searchPhoto(namePhoto);
    
  cardPhoto(data); 
  messageInfo(data); 
  stopSearch(data); 
  e.target.reset(); 
}  

async function onLoadMore() {
    page += 1;
    const { data } = await searchPhoto(namePhoto, page, perPage);
    cardPhoto(data);
    stopSearch(data);
    smoothScroll();
}

function cardPhoto(arr) {
  const markUp = arr.hits
    .map(el => {
      return `
    <div class="photo-card">
    <a class="gallery-link" href="${el.largeImageURL}">
    <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" />
    </a>
    <div class="info">
    <p class="info-item"><b>Likes</b>${el.likes}
    </p>
    <p class="info-item"><b>Views</b>${el.views}
    </p>
    <p class="info-item"><b>Comments</b>${el.comments}
    </p>
    <p class="info-item"><b>Downloads</b>${el.downloads}
    </p>
    </div>
    </div>`;
    })
    .join('');
  galleryPhoto.insertAdjacentHTML('beforeend', markUp);
  lightbox.refresh();
}

function messageInfo(arr) {
  if (arr.hits.length === 0) {
    Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (arr.totalHits !== 0) {
    Notify.success(`Hooray! We found ${arr.totalHits} images.`);
  }
}
function stopSearch(arr) {
  if (arr.hits.length < 40 && arr.hits.length > 0) {
    loadMoreBtn.style.display = 'none';
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  if (arr.hits.length === 40) {
    loadMoreBtn.style.display = 'block';
  }
}
