document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');
    const phoneInput = document.getElementById('phone');
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    // Validación de solo números en el campo de teléfono
    phoneInput.addEventListener('input', function(e) {
        // Eliminar cualquier caracter que no sea número
        this.value = this.value.replace(/\D/g, '');
    });

    // Cargar citas guardadas
    loadAppointments();

    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Obtener valores del formulario
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const service = document.getElementById('service').value;

            // Validaciones
            if (!name || !phone || !email || !date || !time || !service) {
                alert('Por favor complete todos los campos');
                return;
            }

            // Validar teléfono
            if (phone.length !== 10) {
                alert('El número telefónico debe tener 10 dígitos');
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
        } catch (error) {
            console.error('Error al guardar la cita:', error);
            alert('Hubo un error al guardar la cita. Por favor intente nuevamente.');
        }
    });

    function saveAppointment(appointment) {
        try {
            let appointments = getAppointments();
            appointments.push(appointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    }

    function getAppointments() {
        try {
            const appointments = localStorage.getItem('appointments');
            return appointments ? JSON.parse(appointments) : [];
        } catch (error) {
            console.error('Error al obtener citas:', error);
            return [];
        }
    }

    function loadAppointments() {
        let appointments = getAppointments();
        appointmentsList.innerHTML = '';

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-appointments">No hay citas agendadas</p>';
            return;
        }

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

                // Crear mensaje predefinido para SMS
                const smsMessage = `Hola ${appointment.name}, confirmamos tu cita para ${formatDate(appointment.date)} a las ${formatTime(appointment.time)} para ${appointment.service}. ¿Podrías confirmar tu asistencia?`;
                const smsLink = `sms:${appointment.phone}?body=${encodeURIComponent(smsMessage)}`;

                appointmentCard.innerHTML = `
                    <h3>${appointment.name}</h3>
                    <p><strong>Teléfono:</strong> ${formatPhoneNumber(appointment.phone)}</p>
                    <p><strong>Email:</strong> ${appointment.email}</p>
                    <p><strong>Hora:</strong> ${formatTime(appointment.time)}</p>
                    <p><strong>Servicio:</strong> ${appointment.service}</p>
                    <div class="button-group">
                        <button class="sms-btn" onclick="window.open('${smsLink}')">
                            Enviar SMS
                        </button>
                        <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">
                            Cancelar Cita
                        </button>
                    </div>
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
        const cleaned = String(phoneNumber).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phoneNumber;
    }

    // Función global para eliminar citas
    window.deleteAppointment = function(id) {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            try {
                let appointments = getAppointments();
                appointments = appointments.filter(appointment => appointment.id !== id);
                localStorage.setItem('appointments', JSON.stringify(appointments));
                loadAppointments();
            } catch (error) {
                console.error('Error al eliminar la cita:', error);
                alert('Hubo un error al eliminar la cita. Por favor intente nuevamente.');
            }
        }
    }
});
