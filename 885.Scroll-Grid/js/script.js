function handleNavigation(links, lists, activeClass = 'active') {
  if (!links?.length || !lists?.length) return;

  let linkClicked = false;
  let currentRow = 0;
  let currentCol = 0;

  const syncScroll = target => {
    const parent = target.parentNode;
    lists.forEach(ol => ol !== parent && (ol.scrollLeft = parent.scrollLeft));
  };

  const navigateToCell = (row, col) => {
    const targetId = `r${row + 1}-c${col + 1}`;
    const target = document.getElementById(targetId);
    const link = [...links].find(link => link.hash === `#${targetId}`);
    
    if (target && link) {
      linkClicked = true;
      target.scrollIntoView({ behavior: 'smooth' });
      links.forEach(l => l.classList.remove(activeClass));
      link.classList.add(activeClass);
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          syncScroll(target);
          linkClicked = false;
        }, 1000);
      });
    }
  };

  const handleKeydown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        currentCol = Math.max(0, currentCol - 1);
        break;
      case 'ArrowRight':
        currentCol = Math.min(4, currentCol + 1);
        break;
      case 'ArrowUp':
        currentRow = Math.max(0, currentRow - 1);
        break;
      case 'ArrowDown':
        currentRow = Math.min(4, currentRow + 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    navigateToCell(currentRow, currentCol);
  };

  const IO = new IntersectionObserver(entries => 
    entries.forEach(({ isIntersecting, intersectionRatio, target }) => {
      if (isIntersecting && intersectionRatio >= 0.5) {
        links.forEach(link => link.classList.remove(activeClass));
        const link = [...links].find(link => link.hash === `#${target.id}`);
        link?.classList.add(activeClass);
        
        // Update current position when scrolling
        const [_, row, col] = target.id.match(/r(\d+)-c(\d+)/);
        currentRow = parseInt(row) - 1;
        currentCol = parseInt(col) - 1;
        
        if (!linkClicked) syncScroll(target);
      }
    }), { 
      threshold: [0, 0.5, 1.0] 
    }
  );

  links.forEach(link => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    
    IO.observe(target);

    link.addEventListener('click', e => {
      e.preventDefault();
      const [_, row, col] = target.id.match(/r(\d+)-c(\d+)/);
      currentRow = parseInt(row) - 1;
      currentCol = parseInt(col) - 1;
      navigateToCell(currentRow, currentCol);
    });
  });

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown);
}

/* Initialize navigation with links and lists from DOM */
handleNavigation(
  document.querySelectorAll('.ui-scroll-grid-nav a'),
  document.querySelectorAll('.ui-scroll-grid ol')
);