package com.mediconnect.controller;

import com.mediconnect.dto.AdminDashboardStats;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStats> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Doctor>> getPendingDoctors() {
        return ResponseEntity.ok(adminService.getPendingDoctors());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @PostMapping("/doctors/{doctorId}/verify")
    public ResponseEntity<?> verifyDoctor(@PathVariable Long doctorId, @RequestParam boolean verify) {
        adminService.verifyDoctor(doctorId, verify);
        String message = verify ? "Doctor verified and activated." : "Doctor rejected.";
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", message));
    }

    @PostMapping("/doctors/{doctorId}/toggle-status")
    public ResponseEntity<?> toggleDoctorStatus(@PathVariable Long doctorId) {
        adminService.toggleDoctorActiveStatus(doctorId);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Doctor status toggled successfully."));
    }
}

