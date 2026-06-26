package com.bookkeeping.repository;

import com.bookkeeping.entity.AccountRecord;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRecordRepository extends JpaRepository<AccountRecord, Long> {
    List<AccountRecord> findByUserId(Long userId, Sort sort);
}
