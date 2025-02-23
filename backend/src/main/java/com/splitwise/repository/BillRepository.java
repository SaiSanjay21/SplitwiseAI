package com.splitwise.repository;

import com.splitwise.model.Bill;
import com.splitwise.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByGroup(Group group);
}
