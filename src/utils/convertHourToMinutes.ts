export default function convertHourToMinute(time: String) {
    const [hour, minutes] = time.split(':').map(Number);
    const timeInMinutes = (hour * 60) + minutes;

    return timeInMinutes;
}