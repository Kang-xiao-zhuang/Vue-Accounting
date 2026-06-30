package com.bookkeeping.scheduler;

import com.bookkeeping.service.RecurringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Generates due recurring records once a day (for when the app isn't opened). */
@Component
public class RecurringScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecurringScheduler.class);

    private final RecurringService service;

    public RecurringScheduler(RecurringService service) {
        this.service = service;
    }

    // 00:05 every day, server time.
    @Scheduled(cron = "0 5 0 * * *")
    public void generateDue() {
        int created = service.runAllDue();
        if (created > 0) {
            log.info("Recurring scheduler created {} record(s)", created);
        }
    }
}
