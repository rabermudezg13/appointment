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
        const phone = document.getElementById('phone').value.replace(/\D/g, ''); // Eliminar no números
        const email = document.getElementById('email').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const service = document.getElementById('service').value;

        // Validar teléfono
        if (phone.length !== 10) {
            alert('Por favor ingrese un número telefónico válido de 10 dígitos');
            return;
        }

        // Validar que la fecha no sea anterior a hoy
        if (date < today) {
            alert('Por favor seleccione una fecha válida');
            return;
        }

        // Crear objeto de cita
        const appointment = {
            id: Date.now(),
            name,
            phone,
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
        let appointments = getAppointments();
        appointmentsList.innerHTML = '';

        // Ordenar citas por fecha y hora
        appointments.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });

        // Agrupar citas por fecha
        const groupedAppointments = {};
        appointments.forEach(appointment => {
            if (!groupedAppointments[appointment.date]) {
                groupedAppointments[appointment.date] = [];
            }
            groupedAppointments[appointment.date].push(appointment);
        });

        // Mostrar citas agrupadas por fecha
        Object.keys(groupedAppointments).sort().forEach(date => {
            const dateHeader = document.createElement('h3');
            dateHeader.className = 'date-header';
            dateHeader.textContent = formatDate(date);
            appointmentsList.appendChild(dateHeader);

            groupedAppointments[date].forEach(appointment => {
                const appointmentCard = document.createElement('div');
                appointmentCard.className = 'appointment-card';
                appointmentCard.innerHTML = `
                    <h3>${appointment.name}</h3>
                    <p><strong>Teléfono:</strong> ${formatPhoneNumber(appointment.phone)}</p>
                    <p><strong>Email:</strong> ${appointment.email}</p>
                    <p><strong>Hora:</strong> ${formatTime(appointment.time)}</p>
                    <p><strong>Servicio:</strong> ${appointment.service}</p>
                    <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">Cancelar Cita</button>
                `;
                appointmentsList.appendChild(appointmentCard);
            });
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        };
        return date.toLocaleDateString('es-ES', options);
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    function formatPhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phoneNumber;
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
