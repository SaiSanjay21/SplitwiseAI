package com.splitwise.model;

import java.util.List;

public record BillRequest(Double total, List<Split> splits) {}
