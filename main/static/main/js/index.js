const wrapper = document.querySelector(".wrapper__activity");
const form = document.querySelector(".search__form");
const search = document.querySelector(".search__input");
const modalWindow = document.querySelector(".modal");

const URL_API = "http://127.0.0.1:8000/api/events/";

// Функция для получения всех событий
async function getEvents(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const respData = await response.json();
    console.log(respData);
    showEvent(respData);
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
          ? `<div class="event__container_image">
                          <img src="${event.photo}" alt="event" class="event__image" id="image">
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
      const btn_close = document.querySelector(".modal__button_close");
      btn_close.addEventListener("click", closeModal);

      const displayClose = document.querySelector(".modal--show");
      displayClose.addEventListener("click", (e) => {
        if (e.target.className == "modal modal--show") {
          closeModal();
        }
      });
    });

    wrapper.appendChild(eventElement);
  });
}

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
    const apiUrl = `http://127.0.0.1:8000/api/events/?search=${encodeURIComponent(
      search.value
    )}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      showSearchEvents(data);
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  }
}

function showSearchEvents(data) {
  wrapper.innerHTML = ""; // Очистить текущие события
  showEvent(data); // Отобразить новые события
}

// -------------------модалка--------------
function openModal(eventId) {
  modalWindow.classList.add("modal--show");
  document.body.classList.add("stop-scroling");

  fetch(`${URL_API}${eventId}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const sessions = data.sessions
        .map(
          (session) => `
            <div class="modal__session">
              <p class="modal__date_and_time">${new Date(session.date_time).toLocaleString()}</p>
              <p class="modal__free_seats">Свободные места: ${session.available_seats}</p>
              <div class"modal__book_seats">
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
          <div class="modal__slider">
            <div class="modal__slides">
              ${sessions}
            </div>
          </div>
          <button class="modal__prev"></button>
          <button class="modal__next"></button>
          <button class="modal__button_close"></button>
          <p class="modal__status"></p>
        </div>
      `;

      const statusMessage = document.querySelector(".modal__status");

      // Переменные для слайдера
      const slidesContainer = document.querySelector(".modal__slides");
      const slideElements = document.querySelectorAll(".modal__session");
      const prevButton = document.querySelector(".modal__prev");
      const nextButton = document.querySelector(".modal__next");

      let currentSlide = 0;

      // Функция для обновления состояния слайдера
      function updateSlider() {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      }

      // Установка обработчиков для переключения слайдов
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

      // Кнопки бронирования
      document.querySelectorAll(".modal__book-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          const sessionId = e.target.getAttribute("data-session-id");
          const peopleCountInput = e.target.previousElementSibling; // Поле с количеством людей
          const numberOfPeople = parseInt(peopleCountInput.value, 10);

          if (numberOfPeople > 0) {
            bookSession(sessionId, numberOfPeople, statusMessage);
          } else {
            alert("Укажите корректное количество участников!");
          }
        });
      });

      // Обработчик для кнопки закрытия
      const closeButton = document.querySelector(".modal__button_close");
      closeButton.addEventListener("click", closeModal);
    })
    .catch((error) => {
      console.error("Ошибка при загрузке модального окна:", error);
    });
}

function bookSession(sessionId, numberOfPeople, statusMessage) {
  fetch(`/api/register_event/${sessionId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ number_of_people: numberOfPeople }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        statusMessage.textContent = data.message;
        statusMessage.style.color = "green";
      } else {
        statusMessage.textContent = data.error;
        statusMessage.style.color = "red";
      }
    })
    .catch((error) => {
      statusMessage.textContent = "Произошла ошибка при бронировании.";
      statusMessage.style.color = "red";
      console.error("Ошибка бронирования:", error);
    });
}

function closeModal() {
  modalWindow.classList.remove("modal--show");
  document.body.classList.remove("stop-scroling");
}

// Получить все события при загрузке страницы
getEvents(URL_API);
