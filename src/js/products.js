import axios from 'axios';
const KEY = '34348838-2e9a9922ce2037481b30b9efd';
export async function getProducts(search, page) {
  const products = await axios.get(
    `https://pixabay.com/api/?key=${KEY}&q=${search}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );

  return products;
}
