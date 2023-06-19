document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("resultsContainer");
  const paginationContainer = document.getElementById("paginationContainer");
  let currentPage = 1;
  let totalPages = 1;
  let currentSearchTerm = "";
  const API_KEY = "9f2dffcb";

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== "") {
      currentSearchTerm = searchTerm;
      currentPage = 1;
      searchMovies(currentSearchTerm);
    }
  });

  let movies = []; // Declare movies array

  function searchMovies(searchTerm) {
    const apiKey = API_KEY;
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      searchTerm
    )}&page=${currentPage}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.Response === "True") {
          movies = data.Search;
          totalPages = Math.ceil(data.totalResults / 10);
          displayMovies(data.Search);
          displayPagination();
        } else {
          displayError("No results found.");
        }
      })
      .catch((error) => {
        displayError("An error occurred. Please try again later.");
      });
  }

  function displayMovies(movies) {
    resultsContainer.innerHTML = "";

    movies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      resultsContainer.appendChild(movieCard);
    });
  }

  const sortButton = document.getElementById("sortButton");
  sortButton.addEventListener("click", sortResults);
  function sortResults() {
    const sortSelect = document.getElementById("sortSelect");
    const sortBy = sortSelect.value;

    const fetchRatingsPromises = movies.map((movie) =>
      getMovieRatings(movie.imdbID)
    );

    Promise.all(fetchRatingsPromises)
      .then((ratingDataArray) => {
        ratingDataArray.forEach((ratingData, index) => {
          if (ratingData && ratingData.imDb) {
            const imdbRating = ratingData.imDb.rating;
            movies[index].imdbRating = imdbRating;
          }
        });

        if (sortBy === "title") {
          movies.sort((a, b) => a.Title.localeCompare(b.Title));
        } else if (sortBy === "rating") {
          movies.sort((a, b) => {
            if (a.imdbRating && b.imdbRating) {
              return b.imdbRating - a.imdbRating;
            } else if (a.imdbRating) {
              return -1;
            } else if (b.imdbRating) {
              return 1;
            } else {
              return 0;
            }
          });
        } else if (sortBy === "year") {
          movies.sort((a, b) => b.Year - a.Year);
        }

        displayMovies(movies);
      })
      .catch((error) => {
        console.log(error);
        displayMovies(movies);
      });
  }

  function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.setAttribute("id", movie.imdbID);

    const img = document.createElement("img");
    img.src = movie.Poster;
    img.alt = movie.Title;
    movieCard.appendChild(img);

    const title = document.createElement("h3");
    const sortBy = sortSelect.value;

    if (sortBy === "title") {
      title.textContent = movie.Title;
    } else if (sortBy === "rating") {
      title.textContent = `${movie.Title} (IMDb: ${movie.imdbRating})`;
    } else if (sortBy === "year") {
      title.textContent = `${movie.Title} (${movie.Year})`;
    }

    movieCard.appendChild(title);

    const year = document.createElement("p");
    year.textContent = movie.Year;
    movieCard.appendChild(year);

    // Add rating element
    const rating = document.createElement("p");
    if (movie.imdbRating) {
      rating.innerHTML = `<strong>Rating:</strong> ${movie.imdbRating}`;
      movieCard.appendChild(rating);
    }

    const detailsButton = document.createElement("button");
    detailsButton.textContent = "View Details";
    detailsButton.addEventListener("click", function () {
      if (!movieCard.querySelector(".movie-details")) {
        getMovieDetails(movie.imdbID, movieCard);
      }
    });
    movieCard.appendChild(detailsButton);

    return movieCard;
  }

  function getMovieDetails(imdbID) {
    const apiKey = API_KEY;
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(
      imdbID
    )}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.Response === "True") {
          const details = `
            <h3>${data.Title}</h3>
            <img src="${data.Poster}" alt="${data.Title}" />
            <p><strong>Released:</strong> ${data.Released}</p>
            <p><strong>Genre:</strong> ${data.Genre}</p>
            <p><strong>Director:</strong> ${data.Director}</p>
            <p><strong>Actors:</strong> ${data.Actors}</p>
            <p><strong>Plot:</strong> ${data.Plot}</p>
            ${
              data.imdbRating
                ? `<p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>`
                : ""
            }
          `;
          const newWindow = window.open("", "_blank");
          newWindow.document.write(details);
          newWindow.document.close();
          getMovieRatings(imdbID, data);
        } else {
          displayError("Failed to get movie details.");
        }
      })
      .catch((error) => {
        console.log("error::", error);
        displayError("An error occurred. Please try again later.");
      });
  }

  function getMovieRatings(imdbID, movieData) {
    const imdbApiKey = API_KEY;
    const imdbApiUrl = `https://api.imdb.com/title/${imdbID}/ratings?apiKey=${imdbApiKey}`;

    return fetch(imdbApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.errorMessage) {
          return null;
        } else {
          const imdbRating = data.rating.toFixed(1);
          movieData.imdbRating = imdbRating;
          return movieData;
        }
      })
      .catch((error) => {
        displayMovieDetails(movieData);
        return movieData;
      });
  }

  function displayMovieDetails(movie, movieCard) {
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("movie-details");

    const Listkeys = ["Released", "Genre", "Director", "Actors", "Plot"];

    Listkeys.forEach((key) => {
      const element = document.createElement("p");
      element.innerHTML = `<strong>${key}:</strong> ${movie[key]}`;
      detailsContainer.appendChild(element);
    });

    const imdbRating = document.createElement("p");
    if (movie.imdbRating) {
      imdbRating.innerHTML = `<strong>IMDb Rating:</strong> ${movie.imdbRating}`;
      detailsContainer.appendChild(imdbRating);
    }

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", function () {
      detailsContainer.remove();
    });
    detailsContainer.appendChild(closeButton);

    const targetMovieCard = movieCard || movie.closest(".movie-card");
    targetMovieCard.appendChild(detailsContainer);
  }

  // display paginations
  function displayPagination() {
    paginationContainer.innerHTML = "";

    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        searchMovies(currentSearchTerm);
      }
    });
    paginationContainer.appendChild(previousButton);

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        searchMovies(currentSearchTerm);
      }
    });
    previousButton.classList.add("button-gap");
    paginationContainer.appendChild(nextButton);
  }

  function displayError(message) {
    resultsContainer.innerHTML = `<p class="error">${message}</p>`;
  }
});
