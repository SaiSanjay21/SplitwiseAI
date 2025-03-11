package com.splitwise.service;

import com.splitwise.model.Group;
import com.splitwise.model.GroupMember;
import com.splitwise.model.User;
import com.splitwise.repository.GroupMemberRepository;
import com.splitwise.repository.GroupRepository;
import com.splitwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Group createGroup(String name, Long userId) {
        User user = getUserById(userId);
        Group group = new Group();
        group.setName(name);
        group.setCreatedBy(user);
        return groupRepository.save(group);
    }

    public List<Group> getUserGroups(Long userId) {
        User user = getUserById(userId);
        List<Group> memberGroups = groupRepository.findGroupsByMember(user);
        List<Group> createdGroups = groupRepository.findByCreatedBy(user);
        
        // Combine and remove duplicates
        memberGroups.addAll(createdGroups);
        return memberGroups.stream().distinct().toList();
    }

    @Transactional
    public GroupMember addMember(Long groupId, Long userId, String symbol) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = getUserById(userId);

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setSymbol(symbol);
        return memberRepository.save(member);
    }

    public List<GroupMember> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return memberRepository.findByGroup(group);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
