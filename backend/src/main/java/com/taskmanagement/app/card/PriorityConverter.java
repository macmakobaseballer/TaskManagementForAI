package com.taskmanagement.app.card;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PriorityConverter implements AttributeConverter<Priority, String> {

    @Override
    public String convertToDatabaseColumn(Priority priority) {
        if (priority == null) return null;
        return priority.name().toLowerCase();
    }

    @Override
    public Priority convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return Priority.valueOf(dbData.toUpperCase());
    }
}
