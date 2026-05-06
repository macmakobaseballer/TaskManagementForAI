package com.taskmanagement.app.board;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping
    public ResponseEntity<BoardSummaryResponse> createBoard(@RequestBody @Valid BoardCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.createBoard(request));
    }

    @GetMapping
    public ResponseEntity<List<BoardSummaryResponse>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardDetailResponse> getBoardDetail(@PathVariable UUID boardId) {
        return ResponseEntity.ok(boardService.getBoardDetail(boardId));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<BoardSummaryResponse> updateBoard(
            @PathVariable UUID boardId,
            @RequestBody @Valid BoardUpdateRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(boardId, request));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable UUID boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }
}
