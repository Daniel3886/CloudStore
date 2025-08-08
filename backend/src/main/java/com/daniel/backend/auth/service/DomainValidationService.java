package com.daniel.backend.auth.service;

import org.springframework.stereotype.Service;
import org.xbill.DNS.*;
import org.xbill.DNS.Record;

@Service
public class DomainValidationService {

    public boolean isDomainValid(String email) {
        try {
            String domain = extractDomain(email);
            Record[] records = new Lookup(domain, Type.MX).run();
            return records != null && records.length > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String extractDomain(String email) {
        int atIndex = email.lastIndexOf("@");
        return atIndex != -1 ? email.substring(atIndex + 1).toLowerCase() : email.toLowerCase();
    }
}
