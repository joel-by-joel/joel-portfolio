document.documentElement.classList.add('js');
const menu = document.querySelector('#menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
});

const service = document.querySelector('select[name="service"]');
const requested = new URLSearchParams(location.search).get('service');
if (service && Array.from(service.options).some(option => option.value === requested)) {
  service.value = requested;
}

const gallery = document.querySelector('#lightbox');
if (gallery && typeof gallery.showModal === 'function') {
  const image = gallery.querySelector('img');
  let opener;
  document.querySelectorAll('[data-gallery]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      gallery.showModal();
    });
  });
  gallery.querySelector('button').addEventListener('click', () => gallery.close());
  gallery.addEventListener('close', () => opener.focus());
}
