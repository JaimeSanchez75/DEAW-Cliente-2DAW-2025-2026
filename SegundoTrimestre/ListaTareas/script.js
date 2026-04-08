let tareas = [];  // Array de Tareas
// Cargar tareas desde localStorage al iniciar
function cargarTareas() 
{
  const almacenadas = localStorage.getItem('listaTareas');
  if (almacenadas) 
  {
    tareas = JSON.parse(almacenadas);
    tareas = tareas.map(t => 
    ({
      ...t,
      completionDate: t.completionDate || null
    }));
  } 
  else 
  {
    // Datos de ejemplo 
    tareas = 
    [
      {
        id: Date.now() + 1,
        description: "Leer documentación de JavaScript",
        deadline: "2025-04-15T18:00",
        completed: false,
        completionDate: null
      },
      {
        id: Date.now() + 2,
        description: "Hacer ejercicio",
        deadline: null,
        completed: true,
        completionDate: "2025-04-07T10:30:00.000Z"
      }
    ];
  }
  renderizarListas();
}
// Guardar en localStorage
function guardarTareas() {localStorage.setItem('listaTareas', JSON.stringify(tareas));}
// ======================== RENDERIZADO ========================
function renderizarListas() 
{
  const pendingList = document.getElementById('pending-tasks');
  const completedList = document.getElementById('completed-tasks');
  const pendingCountSpan = document.getElementById('pending-count');
  const completedCountSpan = document.getElementById('completed-count');
  // Filtrar tareas
  const pendientes = tareas.filter(t => !t.completed);
  const completadas = tareas.filter(t => t.completed);
  pendingCountSpan.innerText = pendientes.length;
  completedCountSpan.innerText = completadas.length;
  // Limpiar listas
  pendingList.innerHTML = '';
  completedList.innerHTML = '';
  // Renderizar pendientes
  pendientes.forEach(tarea => 
  {
    const li = crearElementoTarea(tarea);
    pendingList.appendChild(li);
  });
  // Renderizar completadas
  completadas.forEach(tarea => 
  {
    const li = crearElementoTarea(tarea);
    completedList.appendChild(li);
  });
}
// Crear Tarea como elemento HTML
function crearElementoTarea(tarea) 
{
  const li = document.createElement('li');
  li.className = `task-item ${tarea.completed ? 'completed' : ''}`;
  li.dataset.id = tarea.id;
  // Contenedor de información
  const infoDiv = document.createElement('div');
  infoDiv.className = 'task-info';
  const descSpan = document.createElement('div');
  descSpan.className = 'task-description';
  descSpan.innerText = tarea.description;
  infoDiv.appendChild(descSpan);
  // Mostrar fecha límite si existe
  if (tarea.deadline && tarea.deadline.trim() !== '') 
  {
    const deadlineSpan = document.createElement('div');
    deadlineSpan.className = 'task-deadline';
    const fechaFormateada = formatearFecha(tarea.deadline);
    deadlineSpan.innerHTML = `📅 Límite: ${fechaFormateada}`;
    infoDiv.appendChild(deadlineSpan);
  }
  // Mostrar fecha de finalización si está completada
  if (tarea.completed && tarea.completionDate) 
  {
    const completionSpan = document.createElement('div');
    completionSpan.className = 'task-completion-date';
    const fechaCompletado = formatearFechaCompleta(tarea.completionDate);
    completionSpan.innerHTML = `Completada: ${fechaCompletado}`;
    infoDiv.appendChild(completionSpan);
  }
  // Contenedor de botones
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-actions';
  if (!tarea.completed) 
  {
    // Botón completar
    const completeBtn = document.createElement('button');
    completeBtn.innerText = '✔ Completar';
    completeBtn.className = 'btn-icon btn-complete';
    completeBtn.addEventListener('click', (e) => 
    {
      e.stopPropagation();
      completarTarea(tarea.id);
    });
    actionsDiv.appendChild(completeBtn);
  }
  // Botón eliminar (siempre visible)
  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = '🗑 Eliminar';
  deleteBtn.className = 'btn-icon btn-delete';
  deleteBtn.addEventListener('click', (e) => 
  {
    e.stopPropagation();
    eliminarTarea(tarea.id);
  });
  actionsDiv.appendChild(deleteBtn);
  li.appendChild(infoDiv);
  li.appendChild(actionsDiv);
  return li;
}
// Formatear fecha datetime-local
function formatearFecha(fechaISO) 
{
  if (!fechaISO) return '';
  try 
  {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', 
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } 
  catch {return fechaISO;}
}
// Formatear fecha completa 
function formatearFechaCompleta(fechaISO) 
{
  try 
  {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', 
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } 
  catch {return fechaISO;}
}
// ======================== LÓGICA ========================
// Añadir nueva tarea
function añadirTarea(descripcion, deadline) 
{
  if (!descripcion || descripcion.trim() === '') 
  {
    alert('La descripción de la tarea es obligatoria.');
    return false;
  }
  const nuevaTarea = 
  {
    id: Date.now(),
    description: descripcion.trim(),
    deadline: deadline && deadline.trim() !== '' ? deadline : null,
    completed: false,
    completionDate: null
  };
  tareas.push(nuevaTarea);
  guardarTareas();
  renderizarListas();
  return true;
}
// Completar tarea
function completarTarea(id)
{
  const tarea = tareas.find(t => t.id === id);
  if (tarea && !tarea.completed) 
  {
    tarea.completed = true;
    tarea.completionDate = new Date().toISOString();
    guardarTareas();
    renderizarListas();
  }
}
// Eliminar una tarea
function eliminarTarea(id) 
{
  tareas = tareas.filter(t => t.id !== id);
  guardarTareas();
  renderizarListas();
}
// Eliminar todas las tareas completadas
function eliminarCompletadas() 
{
  const hayCompletadas = tareas.some(t => t.completed);
  if (!hayCompletadas) 
  {
    alert('No hay tareas completadas para eliminar.');
    return;
  }
  if (confirm('¿Eliminar permanentemente TODAS las tareas completadas?')) 
  {
    tareas = tareas.filter(t => !t.completed);
    guardarTareas();
    renderizarListas();
  }
}
// ======================== INICIALIZACIÓN Y EVENTOS ========================
document.addEventListener('DOMContentLoaded', () => 
{
  cargarTareas();
  const form = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const deadlineInput = document.getElementById('deadline-input');
  const clearCompletedBtn = document.getElementById('clear-completed');
  form.addEventListener('submit', (e) => 
  {
    e.preventDefault();
    const descripcion = taskInput.value;
    const deadline = deadlineInput.value;
    const exito = añadirTarea(descripcion, deadline);
    if (exito) 
    {
      taskInput.value = '';
      deadlineInput.value = '';
      taskInput.focus();
    }
  });
  clearCompletedBtn.addEventListener('click', eliminarCompletadas);
});