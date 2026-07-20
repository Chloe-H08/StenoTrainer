function addSet(strokes, iterations, drill) {
	if(drill == null) drill = []
	strokes = strokes.split('/')
	if(drill.length === 0) {
		drill.push.apply(drill, strokes)
		--iterations
	}
	strokes[0] = '\n' + strokes[0]
	for(let i=0; i<iterations; ++i) {
		drill.push.apply(drill, strokes)
	}
	drill.push(strokes[0])
	return drill
}

function generateFingerDrill(drills, iterations, name) {
	let out = []
	for(const drill of drills) addSet(drill, iterations, out)
	var exercise = new TypeJig.Exercise(out, 0, false, 'ordered');
	if(name) exercise.name = name
	else exercise.name = "Finger Drill: " + drills.join(' ')
	return exercise
}

function generateDreadedDuoDrill(section, drill, iterations) {
	let n = dreadedDuo[section-1].length
	let name = "Da Dreaded Dueling Digit Duo Drills"
	name += ' (Section ' + section + ', #' + drill + ' of ' + n + ')'
	let drills = [ dreadedDuo[section-1][drill-1] ]
	let exercise = generateFingerDrill(drills, iterations, name)
	return exercise;
}

function linkNextDrill(link, fields, updateFields) {
	var section = fields.section, drill = fields.drill;
	if(drill === dreadedDuo[section-1].length) {
		drill = 1;
		if(section === dreadedDuo.length) section = 1;
		else ++section;
	} else ++drill;
	let url = updateURLParameter(window.location.href, 'section', section);
	url = updateURLParameter(url, 'drill', drill);
	link.href = url;
	if(updateFields) {
		fields.section = section;
		fields.drill = drill;
	}
}

function hasFingerDrillSelection(fields) {
	return !!(fields.strokes || fields.book || fields.section || fields.drill)
}

function loadFingerDrillSettings() {
	const setupInputMode = document.getElementById('setup_input_mode')
	if(setupInputMode) {
		const currentMode = (storageAvailable('localStorage') && localStorage.input_mode) || 'text'
		setupInputMode.value = currentMode
		setupInputMode.addEventListener('input', function(evt) {
			if(storageAvailable('localStorage')) localStorage.input_mode = evt.target.value
		})
	}
}

function applyFingerDrillSettings(evt) {
	const setupInputMode = document.getElementById('setup_input_mode')
	if(setupInputMode) hiddenField(this, 'input_mode', setupInputMode.value)
}

function populateFingerDrillOptions() {
	const duo = document.getElementById('duo_section')
	if(duo) {
		for(let i=0; i<dreadedDuo.length; ++i) {
			N(duo, N('option', {value: i+1}, 'Section ' + (i+1)))
		}
	}

	const book = document.getElementById('book_section')
	if(book) {
		const keys = Object.keys(stenotypeFingerTechnique)
		for(let i=0; i<keys.length; ++i) {
			const key = keys[i]
			N(book, N('option', {value: key}, key))
		}
	}
}

function initializeFingerDrillForms() {
	populateFingerDrillOptions()
	loadFingerDrillSettings()
	const forms = document.querySelectorAll('#form form')
	for(let i=0; i<forms.length; ++i) {
		forms[i].addEventListener('submit', applyFingerDrillSettings)
	}
}

function mountFingerDrillSwitcher(fields) {
	const nav = document.getElementById('nav')
	if(!nav) return

	const mode = fields.strokes ? 'custom' :
		(fields.book === 'Stenotype Finger Technique' ? 'book' : 'duo')
	const shell = N('section', {class: 'lesson-switcher'},
		N('div', {class: 'lesson-switcher-title'}, 'Switch Finger Drill'))
	const form = N('form', {class: 'lesson-switcher-form'})
	const list = N('ul')

	const modeSelect = N('select', {name: 'switch_mode'},
		N('option', {value: 'duo'}, 'Dreaded Duo'),
		N('option', {value: 'book'}, 'Stenotype Finger Technique'),
		N('option', {value: 'custom'}, 'Custom Strokes'))
	modeSelect.value = mode

	const inputMode = N('select', {name: 'input_mode'},
		N('option', {value: 'text'}, 'Plover / Text Input'),
		N('option', {value: 'keyboard'}, 'Regular Keyboard'))
	inputMode.value = fields.input_mode || (storageAvailable('localStorage') && localStorage.input_mode) || 'text'

	const duoSection = N('select', {name: 'section'})
	for(let i=0; i<dreadedDuo.length; ++i) {
		N(duoSection, N('option', {value: i+1}, 'Section ' + (i+1)))
	}
	duoSection.value = fields.section || '1'

	const bookSection = N('select', {name: 'book_section'})
	const bookKeys = Object.keys(stenotypeFingerTechnique)
	for(let i=0; i<bookKeys.length; ++i) {
		const key = bookKeys[i]
		N(bookSection, N('option', {value: key}, key))
	}
	bookSection.value = fields.section || bookKeys[0]

	const customStrokes = N('input', {
		type: 'text',
		name: 'strokes',
		value: fields.strokes || ''
	})

	const iterations = N('input', {
		type: 'number',
		name: 'iterations',
		value: fields.iterations || 20,
		step: 5,
		min: 1
	})

	const duoGroup = N('li', {'data-switch-mode': 'duo'},
		N('label', 'Section', duoSection))
	const bookGroup = N('li', {'data-switch-mode': 'book'},
		N('label', 'Section', bookSection))
	const customGroup = N('li', {'data-switch-mode': 'custom'},
		N('label', 'Strokes', customStrokes))

	N(list,
		N('li', N('label', 'Mode', modeSelect)),
		duoGroup,
		bookGroup,
		customGroup,
		N('li', N('label', 'Length / Iterations', iterations)),
		N('li', N('label', 'Input Mode', inputMode)),
		N('li', N('button', {type: 'submit'}, 'Start Selected Drill')))

	form.appendChild(list)
	shell.appendChild(form)
	nav.appendChild(shell)

	function syncMode() {
		const groups = form.querySelectorAll('[data-switch-mode]')
		for(let i=0; i<groups.length; ++i) {
			const group = groups[i]
			group.classList.toggle('is-hidden', group.getAttribute('data-switch-mode') !== modeSelect.value)
		}
	}

	modeSelect.addEventListener('input', syncMode)
	syncMode()

	form.addEventListener('submit', function(evt) {
		evt.preventDefault()
		if(storageAvailable('localStorage')) localStorage.input_mode = inputMode.value
		let url = 'finger-drills.html'
		const parts = [
			'input_mode=' + encodeURIComponent(inputMode.value),
			'iterations=' + encodeURIComponent(iterations.value)
		]
		if(modeSelect.value === 'duo') {
			parts.push('section=' + encodeURIComponent(duoSection.value))
			parts.push('drill=1')
		} else if(modeSelect.value === 'book') {
			parts.push('book=' + encodeURIComponent('Stenotype Finger Technique'))
			parts.push('section=' + encodeURIComponent(bookSection.value))
		} else {
			parts.push('strokes=' + encodeURIComponent(customStrokes.value))
		}
		window.location.href = url + '?' + parts.join('&')
	})
}

function runFingerDrill(fields) {
	fields.iterations = fields.iterations || 20;
	fields.actualWords = {unit: 'strokes per minute', u: 'SPM'}

	let exercise;
	if(fields.strokes) {
		const drills = fields.strokes.split(/\s+/)
		exercise = generateFingerDrill(drills, fields.iterations);
	} else if(fields.book === 'Stenotype Finger Technique') {
		const section = stenotypeFingerTechnique[fields.section] ? fields.section : Object.keys(stenotypeFingerTechnique)[0]
		fields.section = section
		let name = fields.book + ': ' + section
		const drills = stenotypeFingerTechnique[section]
		exercise = generateFingerDrill(drills, fields.iterations, name)
	} else {
		fields.section = Math.max(1, Math.min(fields.section || 1, dreadedDuo.length))
		fields.drill = Math.max(1, Math.min(fields.drill || 1, dreadedDuo[fields.section-1].length))
		exercise = generateDreadedDuoDrill(fields.section, fields.drill, fields.iterations);
	}

	displayOnly('lesson')
	var jig = setExercise(exercise.name, exercise, null, fields);

	const inputMode = document.getElementById('input_mode');
	if(inputMode) {
		const currentMode = fields.input_mode || (storageAvailable('localStorage') && localStorage.input_mode) || 'text'
		inputMode.value = currentMode
		inputMode.addEventListener('input', function(evt) {
			const mode = evt.target.value
			if(storageAvailable('localStorage')) localStorage.input_mode = mode
			const url = updateURLParameter(window.location.href, 'input_mode', mode)
			window.location.href = url
		})
	}

	var next = document.getElementById('new');
	if(fields.strokes || fields.book) next.parentNode.removeChild(next);
	else linkNextDrill(next, fields);
	mountFingerDrillSwitcher(fields)
}

window.onload = function() {
	var fields = parseQueryString(document.location.search)
	if(hasFingerDrillSelection(fields)) runFingerDrill(fields);
	else initializeFingerDrillForms();
}

setTheme()
