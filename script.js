const ALADIN_API_KEY = "YOUR_API_KEY";

const state = {
  books: [],
  filtered: [],
};

const elements = {
  search: document.getElementById("search"),
  series: document.getElementById("series"),
  audience: document.getElementById("audience"),
  age: document.getElementById("age"),
  situation: document.getElementById("situation"),
  books: document.getElementById("books"),
  count: document.getElementById("count"),
  seriesCount: document.getElementById("series-count"),
};

const normalize = (value) => value?.toString().toLowerCase().trim() ?? "";

const buildOptions = (select, values) => {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
};

const buildFilters = (books) => {
  const seriesSet = new Set(books.map((book) => book.series).filter(Boolean));
  const audienceSet = new Set(books.map((book) => book.audience).filter(Boolean));
  const ageSet = new Set(books.map((book) => book.ageRange).filter(Boolean));
  const situationSet = new Set(books.flatMap((book) => book.situation ?? []).filter(Boolean));

  elements.seriesCount.textContent = seriesSet.size;
  buildOptions(elements.series, [...seriesSet]);
  buildOptions(elements.audience, [...audienceSet]);
  buildOptions(elements.age, [...ageSet]);
  buildOptions(elements.situation, [...situationSet]);
};

const matchesKeyword = (book, keyword) => {
  if (!keyword) {
    return true;
  }
  const haystack = normalize(
    [
      book.series,
      book.title,
      book.publisher,
      book.authors?.join(" "),
      book.illustrators?.join(" "),
      book.audience,
      book.ageRange,
      ...(book.situation ?? []),
    ].join(" ")
  );
  return haystack.includes(keyword);
};

const filterBooks = () => {
  const keyword = normalize(elements.search.value);
  const series = elements.series.value;
  const audience = elements.audience.value;
  const ageRange = elements.age.value;
  const situation = elements.situation.value;

  state.filtered = state.books.filter((book) => {
    const seriesMatch = !series || book.series === series;
    const audienceMatch = !audience || book.audience === audience;
    const ageMatch = !ageRange || book.ageRange === ageRange;
    const situationMatch = !situation || (book.situation ?? []).includes(situation);

    return (
      matchesKeyword(book, keyword) &&
      seriesMatch &&
      audienceMatch &&
      ageMatch &&
      situationMatch
    );
  });

  renderBooks();
};

const createTag = (text) => {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = text;
  return span;
};

const renderBooks = () => {
  elements.books.innerHTML = "";
  elements.count.textContent = state.filtered.length;

  state.filtered.forEach((book) => {
    const tile = document.createElement("article");
    tile.className = "book-tile";

    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.style.background = book.coverColor || "#6b6b6b";

    const coverSeries = document.createElement("p");
    coverSeries.className = "book-cover__series";
    coverSeries.textContent = book.series || "미상";

    const coverTitle = document.createElement("p");
    coverTitle.className = "book-cover__title";
    coverTitle.textContent = book.title;

    cover.append(coverSeries, coverTitle);

    const meta = document.createElement("p");
    meta.className = "book-meta";
    const authorText = book.authors?.length ? `글: ${book.authors.join(", ")}` : null;
    const illustratorText = book.illustrators?.length ? `그림: ${book.illustrators.join(", ")}` : null;
    meta.textContent = [authorText, illustratorText].filter(Boolean).join(" · ") || "글/그림: 미상";

    const publisher = document.createElement("p");
    publisher.className = "book-meta";
    publisher.textContent = `출판사: ${book.publisher || "미상"}`;

    const recommendation = document.createElement("p");
    recommendation.textContent = book.recommendation;

    const tags = document.createElement("div");
    tags.className = "book-tags";
    [book.audience, book.ageRange, ...(book.situation ?? [])].filter(Boolean).forEach((tag) => {
      tags.appendChild(createTag(tag));
    });

    tile.append(cover, meta, publisher, recommendation, tags);
    elements.books.appendChild(tile);
  });
};

const fetchBooks = async () => {
  const response = await fetch("data/books.json");
  const books = await response.json();
  state.books = books;
  state.filtered = books;
  buildFilters(books);
  renderBooks();
};

// 알라딘 API 확장 예시 (키를 넣고 활용하세요)
// const fetchAladin = async (isbn) => {
//   const url = `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_API_KEY}&itemIdType=ISBN13&ItemId=${isbn}&output=JS&Version=20131101`;
//   const response = await fetch(url);
//   return response.json();
// };

elements.search.addEventListener("input", filterBooks);
elements.series.addEventListener("change", filterBooks);
elements.audience.addEventListener("change", filterBooks);
elements.age.addEventListener("change", filterBooks);
elements.situation.addEventListener("change", filterBooks);

fetchBooks();
