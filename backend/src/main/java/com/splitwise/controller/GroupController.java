package com.splitwise.controller;

import com.splitwise.model.Group;
import com.splitwise.model.GroupMember;
import com.splitwise.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(
            @RequestBody GroupRequest request,
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(groupService.createGroup(request.name(), userId));
    }

    @GetMapping
    public ResponseEntity<List<Group>> getUserGroups(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupMember> addMember(
            @PathVariable Long groupId,
            @RequestBody MemberRequest request) {
        return ResponseEntity.ok(groupService.addMember(groupId, request.userId(), request.symbol()));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMember>> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupMembers(groupId));
    }
}

record GroupRequest(String name) {}
record MemberRequest(Long userId, String symbol) {}
