
  /* ----- Custom Dropdown ----- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.fg-dropdown_list.active').forEach((el) => {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('[data-selector="fg-dropdown-toggle"][aria-expanded="true"]').forEach((el) => {
      el.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('[data-selector="fg-dropdown-arrow"].active').forEach((el) => {
      el.classList.remove('active');
    });

    function openDropdown(dropdownToggle, dropdownList) {
      const dropdownArrow = dropdownToggle.querySelector('[data-selector="fg-dropdown-arrow"]');
      dropdownList.classList.add('active');
      dropdownArrow.classList.add('active');
      dropdownToggle.setAttribute('aria-expanded', 'true');
      dropdownList.setAttribute('aria-hidden', 'false');
    }

    function closeDropdown(dropdownToggle, dropdownList) {
      const dropdownArrow = dropdownToggle.querySelector('[data-selector="fg-dropdown-arrow"]');
      dropdownList.classList.remove('active');
      dropdownArrow.classList.remove('active');
      dropdownToggle.setAttribute('aria-expanded', 'false');
      dropdownList.setAttribute('aria-hidden', 'true');
    }

    const dropdowns = document.querySelectorAll('[data-selector="fg-dropdown"]');
    dropdowns.forEach((dropdown, index) => {
      const dropdownToggle = dropdown.querySelector('[data-selector="fg-dropdown-toggle"]');
      const dropdownList = dropdown.querySelector('[data-selector="fg-dropdown-list"]');

      const uniqueId = `dropdown${index + 1}`;
      dropdownToggle.setAttribute('aria-controls', uniqueId);
      dropdownList.setAttribute('id', uniqueId);

      dropdownToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
          openDropdown(dropdownToggle, dropdownList);
        } else {
          closeDropdown(dropdownToggle, dropdownList);
        }
      });

      dropdownToggle.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          dropdownList.focus();
        }
      });
    });

    document.addEventListener('click', function () {
      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('[data-selector="fg-dropdown-toggle"]');
        const list = dropdown.querySelector('[data-selector="fg-dropdown-list"]');
        closeDropdown(toggle, list);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdowns.forEach((dropdown) => {
          const toggle = dropdown.querySelector('[data-selector="fg-dropdown-toggle"]');
          const list = dropdown.querySelector('[data-selector="fg-dropdown-list"]');
          closeDropdown(toggle, list);
        });
      }
    });
  });
