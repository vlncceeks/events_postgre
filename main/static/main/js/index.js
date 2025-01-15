const wrapper = document.querySelector(".wrapper__activity");
const form = document.querySelector(".search__form");
const search = document.querySelector(".search__input");
const modalWindow = document.querySelector(".modal");

const URL_API = "http://127.0.0.1:8000/api/events/";
let allEvents = []; // Глобальный массив для хранения всех событий
console.log("CSRF Token:", getCookie("csrftoken"));

window.onscroll = function () {
  toggleScrollButton();
};
function toggleScrollButton() {
  let scrollToTopButton = document.getElementById("scrollToTop");
  if (
    document.body.scrollTop > 800 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }
}

// Функция для получения всех событий
async function getEvents(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const respData = await response.json();
    console.log(respData);
    allEvents = respData; // Сохраняем все события
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
    const apiUrl = `https://eventspostgre-production.up.railway.app/api/events/?search=${encodeURIComponent(
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
  modalWindow.setAttribute("data-event-id", eventId);

  document.body.classList.add("stop-scroling");

  // Находим событие по ID из локального массива
  const event = allEvents.find((e) => e.id === parseInt(eventId));

  if (!event) {
    console.error("Событие не найдено");
    return;
  }

  const sessions = event.event_sessions
    .map(
      (session) => `
        <div class="modal__session" data-session-id="${session.id}">
          <p class="modal__date_and_time">${new Date(
            session.date_time
          ).toLocaleString()}</p>
          <p class="modal__free_seats">Свободные места: ${
            session.available_seats
          }</p>
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

  // Логика слайдера (без изменений)
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

  document.querySelectorAll(".modal__book-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const sessionId = e.target.getAttribute("data-session-id");

      const peopleCountInput = e.target.previousElementSibling.querySelector(
        ".modal__people-count"
      );
      const numberOfPeople = parseInt(peopleCountInput.value, 10);

      if (numberOfPeople > 0) {
        const eventId = modalWindow.getAttribute("data-event-id"); // Сохраняйте eventId в модальном окне
        const statusMessage = document.querySelector(".modal__status");
        bookSession(eventId, sessionId, numberOfPeople, statusMessage);
      } else {
        alert("Укажите корректное количество участников!");
      }
    });
  });

  const closeButton = document.querySelector(".modal__button_close");
  closeButton.addEventListener("click", closeModal);
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
            "Вы не авторизованы. Пожалуйста, войдите в систему, чтобы зарегистрироваться на мероприятие."
          );
          throw new Error(
            "Вы не авторизованы. Пожалуйста, войдите в систему, чтобы зарегистрироваться на мероприятие."
          );
        } else if (response.status === 400) {
          alert(
            "Указано некорректное количество мест. Проверьте данные и повторите попытку."
          );
          throw new Error(
            "Указано некорректное количество мест. Проверьте данные и повторите попытку."
          );
        } else if (response.status === 409) {
          alert(
            "Вы уже зарегистрированы на это мероприятие. Проверьте ваши записи."
          );
          throw new Error(
            "Вы уже зарегистрированы на это мероприятие. Проверьте ваши записи."
          );
        } else if (response.status === 410) {
          alert(
            "К сожалению, все места уже заняты. Попробуйте выбрать другое мероприятие."
          );
          throw new Error(
            "К сожалению, все места уже заняты. Попробуйте выбрать другое мероприятие."
          );
        } else {
          alert("Произошла ошибка при бронировании. Попробуйте снова.");
          throw new Error(
            "Произошла ошибка при бронировании. Попробуйте снова."
          );
        }
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
      statusMessage.textContent = error.message; // Отображаем текст ошибки в модальном окне
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
