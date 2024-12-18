document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    // Cargar citas guardadas
    loadAppointments();

    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const service = document.getElementById('service').value;

        // Validar que la fecha no sea anterior a hoy
        if (date < today) {
            alert('Por favor seleccione una fecha válida');
            return;
        }

        // Crear objeto de cita
        const appointment = {
            id: Date.now(),
            name,
            email,
            date,
            time,
            service
        };

        // Guardar cita
        saveAppointment(appointment);
        
        // Limpiar formulario
        appointmentForm.reset();
        
        // Mostrar mensaje de éxito
        alert('¡Cita agendada con éxito!');
        
        // Recargar lista de citas
        loadAppointments();
    });

    function saveAppointment(appointment) {
        let appointments = getAppointments();
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }

    function getAppointments() {
        return JSON.parse(localStorage.getItem('appointments') || '[]');
    }

    function loadAppointments() {
        const appointments = getAppointments();
        appointmentsList.innerHTML = '';

        // Ordenar citas por fecha y hora
        appointments.sort((a, b) => {
            return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
        });

        appointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'appointment-card';
            appointmentCard.innerHTML = `
                <h3>${appointment.name}</h3>
                <p><strong>Email:</strong> ${appointment.email}</p>
                <p><strong>Fecha:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Hora:</strong> ${formatTime(appointment.time)}</p>
                <p><strong>Servicio:</strong> ${appointment.service}</p>
                <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">Cancelar Cita</button>
            `;
            appointmentsList.appendChild(appointmentCard);
        });
    }

    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    function formatTime(timeString) {
        return timeString;
    }

    // Función global para eliminar citas
    window.deleteAppointment = function(id) {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            let appointments = getAppointments();
            appointments = appointments.filter(appointment => appointment.id !== id);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            loadAppointments();
        }
    }
});
