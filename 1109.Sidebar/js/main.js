/*=============== SHOW & HIDDEN ===============*/
const sidebar = document.getElementById('sidebar'),
      headerToggle = document.getElementById('header-toggle'),
      sidebarClose = document.getElementById('sidebar-close')

/* Show menu */
if(headerToggle){
   headerToggle.addEventListener('click', () =>{
      sidebar.classList.add('show-sidebar')
   })
}

/* Hide menu */
if(sidebarClose){
   sidebarClose.addEventListener('click', () =>{
      sidebar.classList.remove('show-sidebar')
   })
}

/*=============== EXPAND & REDUCE ===============*/
const sidebarExpand = (toggleId, sidebarId) =>{
    const toggle = document.getElementById(toggleId),
          sidebar = document.getElementById(sidebarId)

    toggle.addEventListener('click', () =>{
        // Add sidebar-expand class to sidebar
        sidebar.classList.toggle('sidebar-expand')
    })
}
sidebarExpand ('sidebar-toggle','sidebar')
