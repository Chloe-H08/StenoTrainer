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
}

window.onload = function() {
	var fields = parseQueryString(document.location.search)
	if(hasFingerDrillSelection(fields)) runFingerDrill(fields);
	else initializeFingerDrillForms();
}

setTheme()
