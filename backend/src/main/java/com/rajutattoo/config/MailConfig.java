package com.rajutattoo.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MailConfig {

    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from.email:${RESEND_FROM_EMAIL:Raju Tattoo Arts <onboarding@resend.dev>}}")
    private String resendFromEmail;

    @PostConstruct
    public void verifyResendConfigurationOnStartup() {
        boolean keyDetected = resendApiKey != null && !resendApiKey.trim().isEmpty();
        
        logger.info("==================================================");
        logger.info("RESEND EMAIL API CONFIGURATION VERIFICATION");
        logger.info("RESEND_API_KEY configured: {}", keyDetected ? "YES [PROTECTED]" : "NO (Missing/Empty)");
        logger.info("RESEND_FROM_EMAIL configured: {}", resendFromEmail);
        logger.info("==================================================");
    }
}
