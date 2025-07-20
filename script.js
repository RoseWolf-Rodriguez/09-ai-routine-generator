// Function to save preferences to localStorage
function savePreferences(timeOfDay, focusArea, timeAvailable, energyLevel, activities) {
  const preferences = {
    timeOfDay,
    focusArea,
    timeAvailable,
    energyLevel,
    activities
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
}

// Function to load saved preferences
function loadPreferences() {
  const savedPreferences = localStorage.getItem('routinePreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    
    // Restore select input values
    document.getElementById('timeOfDay').value = preferences.timeOfDay;
    document.getElementById('focusArea').value = preferences.focusArea;
    document.getElementById('timeAvailable').value = preferences.timeAvailable;
    document.getElementById('energyLevel').value = preferences.energyLevel;
    
    // Restore checkbox values
    const checkboxes = document.querySelectorAll('input[name="activities"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = preferences.activities.includes(checkbox.value);
    });
  }
}

// Load saved preferences when page loads
document.addEventListener('DOMContentLoaded', loadPreferences);

// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();
  
  // Get values from all inputs and store them in variables
  // Get the selected time of day
  const timeOfDay = document.getElementById('timeOfDay').value;
  // Get the selected focus area
  const focusArea = document.getElementById('focusArea').value;
  // Get the selected time available
  const timeAvailable = document.getElementById('timeAvailable').value;
  // Get the selected energy level
  const energyLevel = document.getElementById('energyLevel').value;
  // Get all checked preferred activities
  const activityNodes = document.querySelectorAll('input[name="activities"]:checked');
  const preferredActivities = Array.from(activityNodes).map(cb => cb.value);

  // Save preferences to localStorage
  savePreferences(timeOfDay, focusArea, timeAvailable, energyLevel, preferredActivities);

  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {    
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [      
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: `Please create a structured, step-by-step routine for my ${timeOfDay.toLowerCase()} that focuses on ${focusArea.toLowerCase()}. 
I have ${timeAvailable} minutes available and my energy level is ${energyLevel.toLowerCase()}.
My preferred activities include: ${preferredActivities.join(', ')}.

Please provide a clear, numbered routine that:
1. Fits within the time limit
2. Matches my energy level
3. Incorporates my preferred activities where suitable
4. Focuses on ${focusArea.toLowerCase()}
5. Is appropriate for the ${timeOfDay.toLowerCase()}` }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });
    
    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});
