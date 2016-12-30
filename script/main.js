function ajaxSearch(text) {
  const headers = {
    'csrf-token': $('[name="_csrf"]').val()
  }
  return $.ajax({
    url: `/ajax/search`,
    method: 'GET',
    dataType: 'json',
    data: { q: text },
    headers
  })
}

function onSearch () {
  const text = $(this).val()
  const suggestions = $('.ruha-suggestions')

  if (text.length === 0) {
    suggestions.empty()
    return;
  }

  ajaxSearch(text)
    .then(ruhas => {
      suggestions.empty()

      for (let ruha of ruhas) {
        suggestions.append(`<a class="list-group-item" href="${ruhas.self_url}">${ruha.name}</a>`)
      }
    })
}

$('.recipe-search').on('input', onSearch)
