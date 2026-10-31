
  // Wait for the DOM to load
  document.addEventListener('DOMContentLoaded', function () {
    dayjs.extend(dayjs_plugin_relativeTime);
    // Select all elements with the class "cms-date"
    const cmsDates = document.querySelectorAll('.blog_item-date');

    cmsDates.forEach(function (dateElement) {
      const webflowDate = dateElement.textContent.trim();
      const date = dayjs(webflowDate);
      const daysDiff = dayjs().diff(date, 'day');

      let displayText;

      if (daysDiff <= 3) {
        displayText = date.fromNow();
      } else {
        displayText = date.format('MMMM D, YYYY');
      }

      dateElement.textContent = displayText;
    });
  });
