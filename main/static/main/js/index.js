const wrapper = document.querySelector(".wrapper__activity");
const form = document.querySelector(".search__form");
const search = document.querySelector(".search__input");
const modalWindow = document.querySelector(".modal");
const loadMoreButton = document.getElementById("loadMore");
const URL_API = "https://eventspostgre-production.up.railway.app/api/events/";
let allEvents = []; // Глобальный массив для хранения всех событий
let currentPage = 1; // Текущая страница
let hasMoreEvents = true; // Флаг наличия новых данных
var scrollToTopBtn = document.getElementById("scrollToTop");

// Функция для показа или скрытия кнопки
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};
scrollToTopBtn.onclick = function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Функция для получения всех событий
async function getEvents(url, page = 3) {
  if (!hasMoreEvents) return; // Если больше данных нет, ничего не делаем

  try {
    const response = await fetch(`${url}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const respData = await response.json();
    if (respData.results.length === 0) {
      hasMoreEvents = false; // Если больше данных нет, отключаем кнопку
      loadMoreButton.style.display = "none"; // Скрываем кнопку
      return;
    }

    // Добавляем новые события в массив allEvents
    allEvents = [...allEvents, ...respData.results];

    showEvent(respData.results); // Отображаем текущую порцию событий
    currentPage++; // Увеличиваем номер текущей страницы
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}

// Функция для отображения всех событий
function showEvent(data) {
  data.forEach((event) => {
    const eventElement = document.createElement("div");

    eventElement.classList.add("activity__event", "event");
    eventElement.innerHTML = `
      ${
        event.photo
          ? `<div class="event__container_image" style="width: 100%; height: 400px; background-image: url('${event.photo}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        
      </div>`
          : ""
      }
      <div class="events__content content">
        <details class="content__details details">
          <summary class="details__title">${event.title}</summary>
          <p class="details__description">${event.description}</p>
          <p class="details__materials_title"></p>
          <p class="details__materials">${event.materials}</p>
        </details>
        <p class="content__authors">${event.author}</p>
        
        <button class="content__sign_button sign_button" data-event-id="${
          event.id
        }">
          Записаться
        </button>
      </div>
    `;
    const signButton = eventElement.querySelector(".content__sign_button");
    signButton.addEventListener("click", async (e) => {
      const eventId = e.target.getAttribute("data-event-id");
      openModal(eventId);
    });

    wrapper.appendChild(eventElement);
  });
}

loadMoreButton.addEventListener("click", () => {
  getEvents(URL_API, currentPage);
});

// Функция для получения CSRF токена
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Обработчик отправки формы
form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchEvents();
});

// Функция для поиска событий
async function searchEvents() {
  if (search.value) {
    const apiUrl = `https://eventspostgre-production.up.railway.app/api/events/?search=${encodeURIComponent(
      search.value
    )}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      wrapper.innerHTML = ""; // Очистить текущие события
      showEvent(data.results); // Отобразить новые события
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  }
}

// -------------------модалка--------------
function openModal(eventId) {
  modalWindow.innerHTML = ""; // Очистить старое содержимое
  modalWindow.classList.add("modal--show");
  modalWindow.setAttribute("data-event-id", eventId);
  document.body.classList.add("stop-scroling");

  const event = allEvents.find((e) => e.id === parseInt(eventId));
  if (!event) {
    console.error("Событие не найдено");
    return;
  }

  const filterField = `
    <div class="modal__filter">
      <label for="filter-date">Фильтровать по дате:</label>
      <input type="date" id="filter-date" class="modal__filter-date">
    </div>
  `;

  const sessions = event.event_sessions
    .map(
      (session) => `
        <div class="modal__session" data-session-id="${
          session.id
        }" data-date="${session.date_time}">
          <p class="modal__date_and_time">${new Date(
            session.date_time
          ).toLocaleString()}</p>
          <p class="modal__free_seats">Свободные места: ${
            session.available_seats
          }</p>
          <div class="modal__book_seats">
            <p class="modal__seats">Необходимо мест: </p>
            <input type="number" class="modal__people-count" min="1" max="${
              session.available_seats
            }" value="1">
          </div>
          <button class="modal__book-button" data-session-id="${
            session.id
          }">Бронь</button>
        </div>
      `
    )
    .join("");

  modalWindow.innerHTML = `
    <div class="modal__card">
      ${filterField}
      <div class="modal__slider">
        <div class="modal__slides">
          ${sessions}
        </div>
      </div>
      <button class="modal__prev"></button>
      <button class="modal__next"></button>
      <button class="modal__button_close">x</button>
      <p class="modal__status"></p>
    </div>
  `;

  const statusMessage = document.querySelector(".modal__status");
  const filterInput = document.querySelector("#filter-date");
  filterInput.addEventListener("input", () => {
    const selectedDate = new Date(filterInput.value)
      .toISOString()
      .split("T")[0];
    document.querySelectorAll(".modal__session").forEach((sessionElement) => {
      const sessionDate = new Date(sessionElement.dataset.date)
        .toISOString()
        .split("T")[0];
      sessionElement.style.display =
        sessionDate === selectedDate || !filterInput.value ? "block" : "none";
    });
  });

  setupSlider();
  setupBookButtons(statusMessage);
  setupCloseModal();
}

function setupSlider() {
  const slidesContainer = document.querySelector(".modal__slides");
  const slideElements = document.querySelectorAll(".modal__session");
  const prevButton = document.querySelector(".modal__prev");
  const nextButton = document.querySelector(".modal__next");

  let currentSlide = 0;

  function updateSlider() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  prevButton.addEventListener("click", () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      updateSlider();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentSlide < slideElements.length - 1) {
      currentSlide += 1;
      updateSlider();
    }
  });
}

function setupBookButtons(statusMessage) {
  document.querySelectorAll(".modal__book-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const sessionId = e.target.getAttribute("data-session-id");
      const peopleCountInput = e.target.previousElementSibling.querySelector(
        ".modal__people-count"
      );
      const numberOfPeople = parseInt(peopleCountInput.value, 10);

      if (numberOfPeople > 0) {
        const eventId = modalWindow.getAttribute("data-event-id");
        bookSession(eventId, sessionId, numberOfPeople, statusMessage);
      } else {
        alert("Укажите корректное количество участников!");
      }
    });
  });
}

function setupCloseModal() {
  const closeButton = document.querySelector(".modal__button_close");
  closeButton.addEventListener("click", closeModal);

  modalWindow.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal--show")) {
      closeModal();
    }
  });
}

function bookSession(eventId, sessionId, numberOfPeople, statusMessage) {
  fetch(`/api/register_event/${sessionId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({
      session_id: sessionId,
      number_of_people: numberOfPeople,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          alert(
            "Вы не авторизованы. Войдите в систему, чтобы зарегистрироваться."
          );
          throw new Error("Вы не авторизованы.");
        } else if (response.status === 400) {
          alert("Указано некорректное количество мест.");
          throw new Error("Некорректное количество мест.");
        } else if (response.status === 409) {
          alert("Вы уже зарегистрированы на это мероприятие.");
          throw new Error("Уже зарегистрированы.");
        } else if (response.status === 410) {
          alert("Все места уже заняты.");
          throw new Error("Места заняты.");
        } else {
          alert("Ошибка бронирования. Попробуйте снова.");
          throw new Error("Ошибка бронирования.");
        }
      }
      return response.json();
    })
    .then((data) => {
      statusMessage.textContent = data.message || "Успешно забронировано!";
      console.log("Бронирование успешно выполнено:", data);
    })
    .catch((error) => {
      console.error("Ошибка бронирования:", error);
    });
}

function closeModal() {
  modalWindow.classList.remove("modal--show");
  document.body.classList.remove("stop-scroling");
}

// Запуск основного получения событий
getEvents(URL_API, currentPage);
