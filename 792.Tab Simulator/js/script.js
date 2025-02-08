const textInput = document.querySelector('.text-input');
const generateButton = document.querySelector('.button-auto-generate');
const closeAllButton = document.querySelector('.button-close-all');
const tabCounter = document.querySelector('.tab-counter');
const tabBar = document.querySelector('.tab-bar');
const toast = document.querySelector('.toast');
const maxCharLength = 10;
const toastMessages = [
  "Tab zero achieved",
  "That's better",
  "All gone",
  "Goodbye, tabs"
];
const businessTabs = [
  "Synergy",
  "Paradigm Shift",
  "Think Outside the Box",
  "Leveraging Innovation",
  "Holistic Solutions",
  "Value-Added Services",
  "Core Competencies",
  "Seamless Integration",
  "Disruptive Technology",
  "Ecosystem Approach",
  "Digital Transformation",
  "Agile Frameworks",
  "Scalable Solutions",
  "ROI-Driven Strategies",
  "End-to-End Services",
  "360-Degree Solutions",
  "Streamlined Processes",
  "Cutting-Edge Technology",
  "Best-in-Class Services",
  "Future-Forward Thinking",
  "Results-Oriented Approach",
  "Customer-Centric Solutions",
  "Blue Sky Thinking",
  "Operational Excellence",
  "Global Reach",
  "Game-Changing Strategies",
  "Growth Hacking",
  "Industry-Leading Innovation",
  "Visionary Leadership",
  "Collaborative Ecosystem",
  "Mission-Critical Services",
  "Data-Driven Decisions",
  "Disruptive Innovation",
  "Business Intelligence",
  "Next-Gen Technology",
  "Thought Leadership",
  "Tailored Solutions",
  "High-Impact Deliverables",
  "Outcome-Oriented Results",
  "Performance Optimization",
  "Business Agility",
  "Strategic Partnerships",
  "Enhanced Productivity",
  "Proven Track Record",
  "Transformational Growth",
  "Operational Agility",
  "Big Picture Thinking",
  "Smart Solutions",
  "Experience-Driven Design",
  "Breakthrough Insights",
  "Cross-Functional Expertise",
  "Simplified Complexities",
  "Rapid Deployment",
  "Unified Communications",
  "Enterprise Solutions",
  "Frictionless Experiences",
  "On-the-Ground Expertise",
  "Maximizing Potential",
  "Quality-Driven Outcomes",
  "Customized Approaches",
  "Innovative Roadmaps",
  "Business Empowerment",
  "Seamless Collaboration",
  "Measurable Impact",
  "Turning Vision into Reality",
  "Continuous Improvement",
  "Unlocking Possibilities",
  "Data-Powered Insights",
  "Optimized Resources",
  "Visionary Execution",
  "Agile Mindsets",
  "Sustainability-Driven",
  "Resilient Strategies",
  "Proven Solutions",
  "The Digital Frontier",
  "Customer-First Approach",
  "Real-Time Insights",
  "Dynamic Ecosystems",
  "Transformative Experiences",
  "Strategic Visioning",
  "Robust Architecture",
  "Driving Innovation",
  "Empowered Teams",
  "Fast-Track Growth",
  "Reimagining the Future",
  "Integrated Experiences",
  "Business Reinvention",
  "Turning Challenges into Opportunities",
  "Precision Execution",
  "Disruption-Ready Models",
  "Future-Ready Infrastructure",
  "Intelligent Design",
  "Efficiency Maximization",
  "Experience-Led Solutions",
  "Converging Technologies",
  "Powering Possibilities",
  "Digital Acceleration",
  "Competitive Differentiation",
  "Beyond Expectations",
  "Scaling Success"
];

//utilities
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//toast stuff
function showToast() {
  const message = toastMessages[getRandomInt(toastMessages.length)];
  toast.innerHTML = message;
  toast.classList.add('show-toast');
  setTimeout(hideToast, 3000);
}

function hideToast() {
  toast.classList.remove('show-toast');
}

//manage control states to dom collisions

function setControlsDisabledAttr(bool){
  textInput.disabled = bool;
  closeAllButton.disabled = bool;
  generateButton.disabled = bool;
}

//tab stuff

function updateTabCounter(number) {
  tabCounter.setAttribute('data-count', number)
  if(number == 0){
    tabCounter.innerHTML = ":)";
    showToast();
  }
  else{
    tabCounter.innerHTML = number;
  }
}

function closeTab(tab) {
  tab.parentElement.removeChild(tab);
  updateTabCounter(tabBar.childElementCount);
}


function createTab(text) {

  if (text) {
    // create a browser tab element
    const tab = document.createElement('button');
    tab.className = "tab"
    tab.style.setProperty("--favicon-content", `'${text.slice(0,1)}'` );
    tab.style.setProperty("--favicon-hue", getRandomInt(360) );        
    tab.addEventListener('click', () => closeTab(tab), true);

    const tabContent = document.createElement('div');
    tabContent.className = "tab-content"

    const tabText = document.createElement('div');
    tabText.className = "tab-text"
    tabText.textContent = text;

    const closeButton = document.createElement('div');
    closeButton.className = "button-close";

    tabContent.appendChild(tabText);          
    tabContent.appendChild(closeButton);
    tab.appendChild(tabContent);
    tabBar.appendChild(tab);
  }

  // scroll the container to the bottom in case it broke lines
  tabBar.scrollTop = tabBar.scrollHeight;

  // update counter
  updateTabCounter(tabBar.childElementCount);
}

function closeAllTabs(){
  setControlsDisabledAttr(true);
  const allTabs = tabBar.querySelectorAll('.tab');

  //do interval stuff
  let curTabIndex = allTabs.length;
  function handleInterval(){
    --curTabIndex;
    if (curTabIndex >= 0) {
      closeTab(allTabs[curTabIndex]);      
    }
    else{
      clearInterval(deletionInterval);
      setControlsDisabledAttr(false);
    }
  }

  let deletionInterval = setInterval(handleInterval, 100);  
}

function createTabsFromArray(array){
  setControlsDisabledAttr(true);

  //shuffle the array
  const shuffledTabs = array.sort(() => 0.5 - Math.random());

  //get a subset of the array
  let selectedTabs = shuffledTabs.slice(0, 6);

  //do interval stuff
  let curTabIndex = -1;
  function handleInterval(){
    ++curTabIndex;
    if (curTabIndex <= selectedTabs.length) {
      createTab(selectedTabs[curTabIndex]);
    }
    else{
      clearInterval(creationInterval);
      setControlsDisabledAttr(false);
    }
  }

  let creationInterval = setInterval(handleInterval, 200);
}

//init a bunch of listeners

textInput.addEventListener('keypress', (e) => {
  const text = textInput.value.trim();

  //handle enter 
  if (e.key === 'Enter') {  
    createTab(text);
    e.preventDefault();
    textInput.value = '';    
  }

  //handle space
  if (e.key === ' ' && text.length >= maxCharLength) {
    createTab(text);
    e.preventDefault();
    textInput.value = '';    
  }
});

generateButton.addEventListener('click', () => {
  createTabsFromArray(businessTabs);
  hideToast();
});

closeAllButton.addEventListener('click', closeAllTabs, false);

//start with some default tabs
createTabsFromArray(businessTabs);