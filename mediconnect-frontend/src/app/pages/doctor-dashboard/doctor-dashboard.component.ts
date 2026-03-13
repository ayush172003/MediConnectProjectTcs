import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  activeTab = 'today';
  
  todayAppointments: any[] = [];
  allAppointments: any[] = [];
  medicalRecords: any[] = [];
  availabilities: any[] = [];
  
  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  message = '';
  isError = false;

  // Prescription Modal State
  selectedAppointment: any = null;
  prescriptionData = {
    diagnosis: '',
    medicines: '',
    notes: ''
  };
  
  // File Upload State
  uploadPatientId: number | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAppointments();
    this.fetchRecords();
    this.fetchAvailability();
  }

  showMessage(msg: string, error = false) {
    this.message = msg;
    this.isError = error;
    setTimeout(() => this.message = '', 5000);
  }

  fetchAppointments() {
    this.apiService.get<any[]>('/doctor/appointments/today').subscribe(res => this.todayAppointments = res);
    this.apiService.get<any[]>('/doctor/appointments').subscribe(res => this.allAppointments = res);
  }

  fetchRecords() {
    this.apiService.get<any[]>('/doctor/records').subscribe(res => this.medicalRecords = res);
  }

  updateStatus(id: number, status: string) {
    this.apiService.put(`/doctor/appointments/${id}/status?status=${status}`, {}).subscribe({
      next: () => {
        this.showMessage(`Appointment marked as ${status}`);
        this.fetchAppointments();
      },
      error: () => this.showMessage('Failed to update status', true)
    });
  }

  openPrescriptionModal(appt: any) {
    this.selectedAppointment = appt;
    this.prescriptionData = { diagnosis: '', medicines: '', notes: '' };
  }

  submitPrescription() {
    if (!this.selectedAppointment || !this.prescriptionData.diagnosis || !this.prescriptionData.medicines) return;
    
    this.apiService.post(`/doctor/appointments/${this.selectedAppointment.id}/prescription`, this.prescriptionData).subscribe({
      next: () => {
        this.showMessage('Prescription saved and appointment completed!');
        this.selectedAppointment = null;
        this.fetchAppointments();
        this.fetchRecords(); // Update records with new prescription
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to save prescription.';
        this.showMessage(errorMsg, true);
        this.selectedAppointment = null;
      }
    });
  }

  fetchAvailability() {
    this.apiService.get<any[]>('/doctor/availability').subscribe(res => {
      this.availabilities = res;
    });
  }

  addAvailability(day: string) {
    this.availabilities.push({
      dayOfWeek: day,
      startTime: '09:00:00',
      endTime: '17:00:00',
      slotDuration: 30
    });
  }

  removeAvailability(index: number) {
    this.availabilities.splice(index, 1);
  }

  saveAvailability() {
    this.apiService.post('/doctor/availability', this.availabilities).subscribe({
      next: () => this.showMessage('Availability saved successfully'),
      error: () => this.showMessage('Failed to save availability', true)
    });
  }

  hasAvailability(day: string): boolean {
    return this.availabilities.some(a => a.dayOfWeek === day);
  }

  // --- Clinical Document Upload ---
  onFileSelected(event: any, patientId: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadPatientId = patientId;
      this.uploadClinicalFile();
    }
  }

  uploadClinicalFile() {
    if (!this.selectedFile || !this.uploadPatientId) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.postFormData(`/doctor/upload-clinical-file/${this.uploadPatientId}`, formData).subscribe({
      next: () => {
        this.showMessage('Clinical file uploaded for patient successfully!');
        this.selectedFile = null;
        this.uploadPatientId = null;
        this.isUploading = false;
        this.fetchRecords();
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to upload clinical file.';
        this.showMessage(errorMsg, true);
        this.isUploading = false;
      }
    });
  }

  viewFile(fileId: number) {
    const url = `${this.apiService.apiUrl}/files/view/${fileId}`;
    window.open(url, '_blank');
  }
}
