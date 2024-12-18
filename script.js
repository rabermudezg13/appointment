// ... (código anterior se mantiene igual) ...

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
