document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');

    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    // Cargar citas existentes
    loadAppointments();

    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const appointment = {
            id: Date.now(),
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            service: document.getElementById('service').value
        };

        // Guardar la cita
        saveAppointment(appointment);
        
        // Limpiar el formulario
        form.reset();
        
        // Recargar la lista de citas
        loadAppointments();
        
        alert('Cita agendada con éxito');
    });

    function saveAppointment(appointment) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }

    function loadAppointments() {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Limpiar la lista actual
        appointmentsList.innerHTML = '';
        
        // Ordenar citas por fecha y hora
        appointments.sort((a, b) => {
            return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
        });

        // Mostrar cada cita
        appointments.forEach(appointment => {
            const card = document.createElement('div');
            card.className = 'appointment-card';
            
            const smsText = `¡Hola ${appointment.name}! 

            Confirmación de tu cita:
            📅 Fecha: ${appointment.date}
            ⏰ Hora: ${appointment.time}
            💇‍♀️ Servicio: ${appointment.service}

            ¡Te esperamos!
            Salón de Belleza
            📍 14009 sw 88th street 
                Suite 24
            📞 3053397512`;
            
            card.innerHTML = `
                <h3>${appointment.name}</h3>
                <p><strong>Teléfono:</strong> ${appointment.phone}</p>
                <p><strong>Email:</strong> ${appointment.email}</p>
                <p><strong>Fecha:</strong> ${appointment.date}</p>
                <p><strong>Hora:</strong> ${appointment.time}</p>
                <p><strong>Servicio:</strong> ${appointment.service}</p>
                <div class="button-group">
                    <button onclick="window.open('sms:${appointment.phone}?body=${encodeURIComponent(smsText)}')">
                        Enviar SMS
                    </button>
                    <button onclick="deleteAppointment(${appointment.id})">
                        Cancelar Cita
                    </button>
                </div>
            `;
            
            appointmentsList.appendChild(card);
        });
    }

    // Función global para eliminar citas
    window.deleteAppointment = function(id) {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments = appointments.filter(appointment => appointment.id !== id);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            loadAppointments();
        }
    };
});
