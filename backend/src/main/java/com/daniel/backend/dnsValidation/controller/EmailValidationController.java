package com.daniel.backend.dnsValidation.controller;

import com.daniel.backend.dnsValidation.service.DnsValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailValidationController {

    @Autowired
    private DnsValidationService dnsValidationService;

    public EmailValidationController(DnsValidationService dnsValidationService) {
        this.dnsValidationService = dnsValidationService;
    }

    @GetMapping("/validate")
    public boolean validateEmail(@RequestParam String email) {
        return dnsValidationService.isDomainValid(email);
    }
}
