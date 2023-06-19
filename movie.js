document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("resultsContainer");
  const paginationContainer = document.getElementById("paginationContainer");
  let currentPage = 1;
  let totalPages = 1;
  let currentSearchTerm = "";

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== "") {
      currentSearchTerm = searchTerm;
      currentPage = 1;
      searchMovies(currentSearchTerm);
    }
  });

  function searchMovies(searchTerm) {
    const apiKey = "9f2dffcb";
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      searchTerm
    )}&page=${currentPage}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.Response === "True") {
          totalPages = Math.ceil(data.totalResults / 10);
          displayMovies(data.Search);
          displayPagination();
        } else {
          displayError("No results found.");
        }
      })
      .catch((error) => {
        console.log(error);
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
  function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.setAttribute("id", movie.imdbID);

    const img = document.createElement("img");
    img.src = movie.Poster;
    img.alt = movie.Title;
    movieCard.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = movie.Title;
    movieCard.appendChild(title);

    const year = document.createElement("p");
    year.textContent = movie.Year;
    movieCard.appendChild(year);

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
    const apiKey = "9f2dffcb";
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
        console.log("error::",error)
        displayError("An error occurred. Please try again later.");
      });
  }

  function getMovieRatings(imdbID, movieData) {
    const imdbApiKey = "9f2dffcb";
    const imdbApiUrl = `https://api.imdb.com/title/${imdbID}/ratings?apiKey=${imdbApiKey}`;

    fetch(imdbApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.errorMessage) {
          displayMovieDetails(movieData);
        } else {
          const imdbRating = data.rating.toFixed(1);
          movieData.imdbRating = imdbRating;
          displayMovieDetails(movieData);
        }
      })
      .catch((error) => {
        displayMovieDetails(movieData);
      });
  }

  function displayMovieDetails(movie, movieCard) {
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("movie-details");

    const title = document.createElement("h3");
    title.textContent = movie.Title;
    detailsContainer.appendChild(title);

    const released = document.createElement("p");
    released.innerHTML = `<strong>Released:</strong> ${movie.Released}`;
    detailsContainer.appendChild(released);

    const genre = document.createElement("p");
    genre.innerHTML = `<strong>Genre:</strong> ${movie.Genre}`;
    detailsContainer.appendChild(genre);

    const director = document.createElement("p");
    director.innerHTML = `<strong>Director:</strong> ${movie.Director}`;
    detailsContainer.appendChild(director);

    const actors = document.createElement("p");
    actors.innerHTML = `<strong>Actors:</strong> ${movie.Actors}`;
    detailsContainer.appendChild(actors);

    const plot = document.createElement("p");
    plot.innerHTML = `<strong>Plot:</strong> ${movie.Plot}`;
    detailsContainer.appendChild(plot);

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
