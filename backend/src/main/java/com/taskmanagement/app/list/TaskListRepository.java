package com.taskmanagement.app.list;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskListRepository extends JpaRepository<TaskList, UUID> {
}
