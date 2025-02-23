package com.splitwise.repository;

import com.splitwise.model.Group;
import com.splitwise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCreatedBy(User user);
    
    @Query("SELECT g FROM Group g JOIN GroupMember gm ON g.id = gm.group.id WHERE gm.user = ?1")
    List<Group> findGroupsByMember(User user);
}
