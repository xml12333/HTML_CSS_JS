function outputNames() {

  let lowerCased = names => names

  let upperCased = names =>
    names.length > 0
    ? Array.isArray(names)
      ? names.map(name => name[0].toUpperCase() + name.substring(1))
      : names[0].toUpperCase() + names.substring(1)
    : ''

  let initial = names =>
    names.length > 0
    ? Array.isArray(names)
      ? names.map(name => name[0])
      : names[0]
    : ''

  let initials = names =>
    names.length > 0
    ? Array.isArray(names)
      ? names.map(name => `${name[0]}.`)
      : `${names[0]}.`
    : ''

  let flush = names =>
    Array.isArray(names)
    ? names.join('')
    : names

  let spaced = names =>
    Array.isArray(names)
    ? names.join(' ')
    : names

  let hyphenated = names =>
    Array.isArray(names)
    ? names.join('-')
    : names

  let rules = [

    // First-related

    // First
    (fname='', mname=[], lname=[]) =>
      upperCased(fname),

    // First Last-Name
    (fname='', mname=[], lname=[]) =>
      `${upperCased(fname)} ${hyphenated(upperCased(lname))}`,

    // First-Middle-Name
    (fname='', mname=[], lname=[]) =>
      `${upperCased(fname)}${mname ? `-${hyphenated(upperCased(mname))}` : ''}`,

    // First M N Last-Name
    (fname='', mname=[], lname=[]) =>
      `${upperCased(fname)} ${spaced(initial(upperCased(mname)))} ${hyphenated(upperCased(lname))}`,

    // First Middle Name Last-Name
    (fname='', mname=[], lname=[]) =>
      `${upperCased(fname)} ${spaced(upperCased(mname))} ${hyphenated(upperCased(lname))}`,


    // Middle-related

    // Middle
    (fname='', mname=[], lname=[]) =>
      upperCased(Array.isArray(mname) ? mname[0] : mname),

    // Middle-Name
    (fname='', mname=[], lname=[]) =>
      hyphenated(upperCased(mname)),

    // Middle Name
    (fname='', mname=[], lname=[]) =>
      spaced(upperCased(mname)),

    // Middle Last Name
    (fname='', mname=[], lname=[]) =>
      `${upperCased(Array.isArray(mname) ? mname[0] : mname)} ${hyphenated(upperCased(lname))}`,

    // Middle Name Last-Name
    (fname='', mname=[], lname=[]) =>
      `${spaced(upperCased(mname))} ${hyphenated(upperCased(lname))}`,

    // Last-related

    // Last-Name
    (fname='', mname=[], lname=[]) =>
      `${hyphenated(upperCased(lname))}`,


    // Initials-related

    // F. Last-Name
    (fname='', mname=[], lname=[]) =>
      `${initials(upperCased(fname))} ${hyphenated(upperCased(lname))}`,

    // FMN Last-Name
    (fname='', mname=[], lname=[]) =>
      `${initial(upperCased(fname))}${flush(initial(upperCased(mname)))} ${hyphenated(upperCased(lname))}`,

    // F M N Last-Name
    (fname='', mname=[], lname=[]) =>
      `${initial(upperCased(fname))} ${spaced(initial(upperCased(mname)))} ${hyphenated(upperCased(lname))}`,

    // F. M. N. Last-Name
    (fname='', mname=[], lname=[]) =>
      `${initials(upperCased(fname))} ${spaced(initials(upperCased(mname)))} ${hyphenated(upperCased(lname))}`,

    // F. M. N. L.N.
    (fname='', mname=[], lname=[]) =>
      `${initials(upperCased(fname))} ${spaced(initials(upperCased(mname)))} ${flush(initials(upperCased(lname)))}`,

    // FMNLN
    (fname='', mname=[], lname=[]) =>
      `${initial(upperCased(fname))}${flush(initial(upperCased(mname)))}${flush(initial(upperCased(lname)))}`,


    // Title-related

    // Mr. First Last-Name
    (fname='', mname=[], lname=[]) =>
      `Mr. ${upperCased(fname)} ${hyphenated(upperCased(lname))}`,

    // Mrs. First Last-Name
    (fname='', mname=[], lname=[]) =>
      `Mrs. ${upperCased(fname)} ${hyphenated(upperCased(lname))}`,

    // Mr. Last-Name
    (fname='', mname=[], lname=[]) =>
      `Mr. ${hyphenated(upperCased(lname))}`,

    // Mrs. Last-Name
    (fname='', mname=[], lname=[]) =>
      `Mrs. ${hyphenated(upperCased(lname))}`,

    // Mr. L
    (fname='', mname=[], lname=[]) =>
      `Mr. ${initial(upperCased(lname))[0] || initial(upperCased(lname))}`,

    // Mrs. L
    (fname='', mname=[], lname=[]) =>
      `Mrs. ${initial(upperCased(lname))[0] || initial(upperCased(lname))}`,

  ]

  let ul = document.querySelector('#output')
  let data = JSON.parse(document.querySelector('textarea').value)

  if (data && data.length > 0 && Array.isArray(data)) {

    ul.innerHTML = ''
    
    rules
    
      .forEach(rule => {

        let li = document.createElement('li')

        li.innerHTML = rule(data[0], data[1], data[2]).replace(/[\s]+/g, ' ')

        if (li.innerHTML !== ''
            && Array.from(ul.children)
                 .filter(el => el.innerHTML === li.innerHTML)
                 .length === 0
        ) {
        
          ul.appendChild(li)

        }

      })

  }

}

let textarea = document.querySelector('textarea')

textarea.addEventListener('keyup', outputNames)
textarea.addEventListener('paste', outputNames)
textarea.addEventListener('blur', outputNames)

document.querySelectorAll('code').forEach(tag => {

  tag.title = 'Click to use…'
                                          
  tag.addEventListener('click', e => {

    textarea.value = e.target.innerHTML

    return outputNames()

  })

})